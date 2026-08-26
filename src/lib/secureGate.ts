/**
 * Client-side password + TOTP (RFC 6238) gate for raphael-publish.
 *
 * STATIC SITE LIMITATION
 * ----------------------
 * There is no backend. Password + TOTP secret are HARDCODED in
 * `gateConfig.ts` and shipped in the JS bundle, so anyone with view-source
 * can read them. This is OBSCURITY-BASED gating, not real auth.
 *
 * DESIGN
 * ------
 * To make "configure once, works in every browser" possible, we use ONLY
 * the hardcoded defaults. There is NO per-browser override mechanism —
 * that would create the cross-browser inconsistency users reported.
 *
 * If you want different credentials: edit DEFAULT_PASSWORD and
 * DEFAULT_TOTP_SECRET in `gateConfig.ts`, rebuild, and redeploy.
 *
 * Migration note: previous versions wrote per-browser overrides to
 * localStorage. On first load we transparently delete any leftover
 * record so old state can't conflict with the new global config.
 */

import { DEFAULT_PASSWORD, DEFAULT_TOTP_SECRET, TOTP_ISSUER, TOTP_ACCOUNT } from './gateConfig';

const UNLOCKED_KEY = 'raphael-gate-v1-unlocked';
const LEGACY_KEYS = ['raphael-gate-v1']; // older versions

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

// ---------- Public API used by Gate.tsx --------------------------------------

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
 * Clear any leftover per-browser override state from previous versions.
 * Call once on Gate mount to ensure a clean slate.
 */
export function purgeLegacyState(): boolean {
  let removed = false;
  for (const key of LEGACY_KEYS) {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      removed = true;
    }
  }
  return removed;
}

/**
 * Verify the visitor's credentials against the hardcoded defaults.
 */
export async function unlockWithPasswordAndTotp(password: string, code: string): Promise<boolean> {
  const passwordOk = constantTimeEqual(password, DEFAULT_PASSWORD);
  if (!passwordOk) return false;

  const totpOk = await verifyTotp(DEFAULT_TOTP_SECRET, code.trim());
  if (!totpOk) return false;

  unlock();
  return true;
}

export function otpauthUrl(secret: string, account = TOTP_ACCOUNT, issuer = TOTP_ISSUER): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

// Back-compat alias
export const DEFAULT_ADMIN_PASSWORD = DEFAULT_PASSWORD;