/**
 * Client-side password + TOTP (RFC 6238) gate for raphael-publish.
 *
 * STATIC SITE LIMITATION
 * ----------------------
 * There is no backend. Password + TOTP secret are hardcoded in
 * `gateConfig.ts` and shipped in the JS bundle, so anyone with view-source
 * can read them. This is OBSCURITY-BASED gating, not real auth.
 *
 * Flow:
 *   1. User visits the site → sees lock screen with default password hint
 *      and TOTP secret (so they can add it to their authenticator).
 *   2. User enters default password + current 6-digit TOTP code.
 *   3. Gate verifies HMAC-SHA1(defaultSecret, floor(now/30)) truncated to
 *      6 digits (±1 step tolerance for clock drift).
 *   4. sessionStorage marks this tab as unlocked — reload keeps unlocked.
 *   5. Opening a new browser/incognito → just re-enter same credentials.
 *      NO per-browser setup required.
 *
 * Optional per-browser override:
 *   If the user wants a different password/TOTP on a specific browser
 *   (e.g., to revoke access from a lost laptop), they can use the
 *   "Customize for this browser" panel which writes to localStorage.
 *   Defaults always work as a fallback.
 */

import { DEFAULT_PASSWORD, DEFAULT_TOTP_SECRET, TOTP_ISSUER, TOTP_ACCOUNT } from './gateConfig';

const STORAGE_KEY = 'raphael-gate-v1';
const UNLOCKED_KEY = 'raphael-gate-v1-unlocked';

// ---------- SHA-256 + Base32 + HMAC-SHA1 primitives (browser Web Crypto) ----

function base32ToBytes(s: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = s.replace(/=+$/g, '').toUpperCase();
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return new Uint8Array(out);
}

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha1(key: Uint8Array, msg: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, msg);
  return new Uint8Array(sig);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// ---------- TOTP core --------------------------------------------------------

const STEP = 30; // seconds

export async function generateTotp(secretB32: string, atSeconds?: number): Promise<string> {
  const t = Math.floor((atSeconds ?? Date.now() / 1000) / STEP);
  const timeBytes = new Uint8Array(8);
  let v = t;
  for (let i = 7; i >= 0; i--) { timeBytes[i] = v & 0xff; v = Math.floor(v / 256); }
  const key = base32ToBytes(secretB32);
  const hash = await hmacSha1(key, timeBytes);
  const offset = hash[hash.length - 1] & 0x0f;
  const bin = ((hash[offset] & 0x7f) << 24) | ((hash[offset + 1] & 0xff) << 16) | ((hash[offset + 2] & 0xff) << 8) | (hash[offset + 3] & 0xff);
  return String(bin % 1_000_000).padStart(6, '0');
}

// Accept codes within ±1 step to tolerate clock drift.
export async function verifyTotp(secretB32: string, code: string): Promise<boolean> {
  const now = Date.now() / 1000;
  for (const offset of [-1, 0, 1]) {
    const candidate = await generateTotp(secretB32, now + offset * STEP);
    if (constantTimeEqual(candidate, code)) return true;
  }
  return false;
}

// ---------- Storage shape (per-browser override) ----------------------------

export interface GateRecord {
  passwordHash: string;
  totpSecret: string;
  createdAt: number;
}

function readOverride(): GateRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GateRecord;
  } catch { return null; }
}

export function clearOverride(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function setOverride(password: string, totpSecret: string): Promise<void> {
  const passwordHash = await sha256(password);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ passwordHash, totpSecret, createdAt: Date.now() }));
}

// ---------- Public API used by Gate.tsx --------------------------------------

export interface ResolvedConfig {
  password: string;       // plain text default; or "" if per-browser override is set (then we compare hashes)
  totpSecret: string;
  source: 'default' | 'override';
}

export function getActiveConfig(): ResolvedConfig {
  const override = readOverride();
  if (override) {
    return { password: '', totpSecret: override.totpSecret, source: 'override' };
  }
  return { password: DEFAULT_PASSWORD, totpSecret: DEFAULT_TOTP_SECRET, source: 'default' };
}

export function getDefaults(): { password: string; totpSecret: string; issuer: string; account: string } {
  return { password: DEFAULT_PASSWORD, totpSecret: DEFAULT_TOTP_SECRET, issuer: TOTP_ISSUER, account: TOTP_ACCOUNT };
}

export function loadStatus(): { unlocked: boolean } {
  return { unlocked: sessionStorage.getItem(UNLOCKED_KEY) === '1' };
}

export function unlock(): void {
  sessionStorage.setItem(UNLOCKED_KEY, '1');
}

export function lock(): void {
  sessionStorage.removeItem(UNLOCKED_KEY);
}

/**
 * Verify the visitor's credentials against the active config.
 * - When using defaults, password is compared as plain text (it's hardcoded anyway).
 * - When using per-browser override, password is hashed and compared.
 */
export async function unlockWithPasswordAndTotp(password: string, code: string): Promise<boolean> {
  const cfg = getActiveConfig();
  let passwordOk = false;
  if (cfg.source === 'default') {
    passwordOk = constantTimeEqual(password, cfg.password);
  } else {
    const override = readOverride();
    if (override) {
      const h = await sha256(password);
      passwordOk = constantTimeEqual(h, override.passwordHash);
    }
  }
  if (!passwordOk) return false;

  const totpOk = await verifyTotp(cfg.totpSecret, code.trim());
  if (!totpOk) return false;

  unlock();
  return true;
}

export function otpauthUrl(secret: string, account = TOTP_ACCOUNT, issuer = TOTP_ISSUER): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

// Back-compat aliases kept so any other imports still work
export const DEFAULT_ADMIN_PASSWORD = DEFAULT_PASSWORD;