/**
 * Hardcoded gate config — shared across ALL browsers/devices.
 *
 * This is a STATIC site (GitHub Pages, no backend), so we cannot sync
 * per-user state across browsers. Instead, the password and TOTP secret
 * are baked into the JS bundle: edit them here, rebuild & deploy, and
 * everyone with the link can access with the same credentials.
 *
 * SECURITY NOTE
 * -------------
 * Anyone with view-source can read these values. This gate provides
 * friction, not confidentiality. If you need real protection, move the
 * site behind Cloudflare Access / a serverless function / Netlify
 * Identity / etc.
 *
 * HOW TO CHANGE THE PASSWORD
 * ---------------------------
 * 1. Pick a strong password
 * 2. Replace DEFAULT_PASSWORD below (plain text is fine — see security note)
 * 3. (Optional) Re-hash it via:   openssl dgst -sha256 <<< "your-password"
 * 4. Rebuild & redeploy
 *
 * HOW TO CHANGE THE TOTP SECRET
 * -----------------------------
 * 1. Generate a fresh Base32 secret:   openssl rand -base64 20 | base32 | tr -d '=' | head -c 32
 * 2. Replace DEFAULT_TOTP_SECRET below
 * 3. Share the new secret with all authorized users (they re-add it to
 *    their authenticator app)
 * 4. Rebuild & redeploy
 *
 * DEFAULT VALUES (provided for quick start — CHANGE FOR PRODUCTION!)
 * -------------------------------------------------------------------
 * Password : Raphael2026!
 * Secret   : JBSWY3DPEHPK3PXP (RFC 6238 test vector, public knowledge)
 *
 * The default secret is well-known — for any real use, generate your own.
 */

export const DEFAULT_PASSWORD = 'Raphael2026!';
export const DEFAULT_TOTP_SECRET = 'JBSWY3DPEHPK3PXP';
export const TOTP_ISSUER = 'RaphaelPublish';
export const TOTP_ACCOUNT = 'raphael-admin';