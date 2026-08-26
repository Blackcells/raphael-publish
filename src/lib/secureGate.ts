/**
 * Client-side password + TOTP (RFC 6238) gate for raphael-publish.
 *
 * SECURITY NOTE
 * -------------
 * This is a STATIC GitHub Pages site — there is no backend. The TOTP shared
 * secret ships inside the JS bundle, so any visitor who downloads the bundle
 * can extract it. This gate provides friction (must enter current 6-digit
 * code from authenticator app), not true confidentiality. If you need real
 * protection, host a serverless function or move behind Cloudflare Access.
 *
 * Two-phase setup:
 *   Phase 1 — admin sets the password by hashing a one-time code and storing
 *             the TOTP secret + password hash in localStorage.
 *   Phase 2 — visitor enters current TOTP code; gate verifies against
 *             HMAC-SHA1(secret, floor(unixSeconds / 30)) truncated to 6 digits.
 *
 * The initial admin password defaults to `Raphael2026!` (printed in the
 * deployment message). Change it in main.tsx or via the in-app setup screen.
 */

const STORAGE_KEY = 'raphael-gate-v1';

// ---------- SHA-256 + Base32 + HMAC-SHA1 primitives (browser Web Crypto) ----

function bufToBase32(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      out += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += alphabet[(value << (5 - bits)) & 31];
  return out;
}

function randomSecret(): string {
  const bytes = new Uint8Array(20); // 160-bit
  crypto.getRandomValues(bytes);
  return bufToBase32(bytes);
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

// Accept codes within ±1 step to tolerate clock drift.
export async function verifyTotp(secretB32: string, code: string): Promise<boolean> {
  const now = Date.now() / 1000;
  for (const offset of [-1, 0, 1]) {
    const candidate = await generateTotp(secretB32, now + offset * STEP);
    if (constantTimeEqual(candidate, code)) return true;
  }
  return false;
}

// ---------- Storage shape ---------------------------------------------------

export interface GateRecord {
  passwordHash: string;
  totpSecret: string;
  createdAt: number;
}

export interface GateStatus {
  configured: boolean;
  unlocked: boolean;
}

function readRecord(): GateRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GateRecord;
  } catch { return null; }
}

function writeRecord(rec: GateRecord) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
}

export function loadStatus(): GateStatus {
  return { configured: !!readRecord(), unlocked: sessionStorage.getItem(STORAGE_KEY + '-unlocked') === '1' };
}

// Default admin password for first-time setup; change in src/config.ts.
export const DEFAULT_ADMIN_PASSWORD = 'Raphael2026!';

export async function setupGate(password: string): Promise<{ secret: string; passwordHash: string }> {
  const secret = randomSecret();
  const passwordHash = await sha256(password);
  writeRecord({ passwordHash, totpSecret: secret, createdAt: Date.now() });
  return { secret, passwordHash };
}

export async function resetGate(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY + '-unlocked');
}

export async function unlockWithTotp(code: string): Promise<boolean> {
  const rec = readRecord();
  if (!rec) return false;
  const ok = await verifyTotp(rec.totpSecret, code.trim());
  if (ok) sessionStorage.setItem(STORAGE_KEY + '-unlocked', '1');
  return ok;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const rec = readRecord();
  if (!rec) return false;
  const h = await sha256(password);
  return constantTimeEqual(h, rec.passwordHash);
}

export function otpauthUrl(secret: string, account = 'raphael-admin', issuer = 'RaphaelPublish'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}