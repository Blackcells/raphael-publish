import { useEffect, useState } from 'react';
import {
  loadStatus,
  setupGate,
  unlockWithTotp,
  resetGate,
  otpauthUrl,
  generateTotp,
  type GateStatus,
} from '../lib/secureGate';

export function Gate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<GateStatus>({ configured: false, unlocked: false });
  const [pw, setPw] = useState('');
  const [totp, setTotp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string>('');

  useEffect(() => { setStatus(loadStatus()); }, []);

  async function refresh() { setStatus(loadStatus()); }

  async function onSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pw) return;
    const { secret } = await setupGate(pw);
    setSetupSecret(secret);
  }

  async function onUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const ok = await unlockWithTotp(totp);
    if (!ok) { setError('动态口令错误或已过期'); return; }
    setTotp(''); setPw('');
    await refresh();
  }

  async function onReset() {
    if (!confirm('确定要重置门禁吗？这会清除当前密钥，所有人需重新设置。')) return;
    await resetGate();
    setSetupSecret(null); setPw(''); setOtpCode(''); setError(null);
    await refresh();
  }

  // ---- Unlocked ----------------------------------------------------------
  if (status.unlocked) {
    return (
      <>
        {children}
        <button
          onClick={async () => { await resetGate(); await refresh(); }}
          title="重置门禁"
          style={{
            position: 'fixed', bottom: 12, right: 12, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
            borderRadius: 999, padding: '6px 12px', fontSize: 11, cursor: 'pointer',
          }}
        >🔒 重置门禁</button>
      </>
    );
  }

  // ---- Setup phase (no record yet) ---------------------------------------
  if (!status.configured && !setupSecret) {
    return (
      <Shell title="首次访问 · 设置门禁" subtitle="设置管理员密码，并初始化 2FA 双因素验证（Authenticator / 1Password / Bitwarden 等支持 TOTP 的应用）">
        <form onSubmit={onSetup}>
          <label style={lbl}>设置管理员密码</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} style={input} placeholder="（记住这个密码，用于重置门禁）" autoFocus />
          <button type="submit" style={btn}>下一步 · 生成 2FA 密钥</button>
        </form>
      </Shell>
    );
  }

  // ---- Setup phase 2 (record just created, show secret + QR URL) ---------
  if (!status.configured && setupSecret) {
    return (
      <Shell title="初始化 2FA" subtitle="用任意 TOTP 应用扫描下面的密钥或点击 otpauth 链接，然后输入 6 位动态口令完成绑定">
        <SecretBlock secret={setupSecret} />
        <button onClick={async () => { await resetGate(); setSetupSecret(null); }} style={{ ...btn, background: '#aaa', marginTop: 12 }}>取消，重新设置</button>
      </Shell>
    );
  }

  // ---- Configured, locked → TOTP unlock ----------------------------------
  return (
    <Shell title="访问验证 · 2FA" subtitle="输入认证器 App 中的当前 6 位动态口令（Google Authenticator / 1Password / Bitwarden 等）">
      <form onSubmit={onUnlock}>
        <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={totp} onChange={(e) => setTotp(e.target.value.replace(/\D/g, ''))} style={{ ...input, fontSize: 28, letterSpacing: 12, textAlign: 'center', fontFamily: 'SF Mono, monospace' }} placeholder="000000" autoFocus />
        {error && <div style={{ color: '#ff3b30', fontSize: 13, marginTop: 6 }}>{error}</div>}
        <button type="submit" style={btn}>解锁</button>
        <button type="button" onClick={onReset} style={{ ...btn, background: '#aaa', marginTop: 8 }}>忘记口令？重置门禁</button>
      </form>
    </Shell>
  );
}

// ---------- Helpers ---------------------------------------------------------

function SecretBlock({ secret }: { secret: string }) {
  const url = otpauthUrl(secret);
  const [now, setNow] = useState('------');
  useEffect(() => {
    let t = 0;
    const tick = async () => {
      const code = await generateTotp(secret);
      setNow(code);
      t = window.setTimeout(tick, 1000);
    };
    tick();
    return () => clearTimeout(t);
  }, [secret]);

  const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => {});

  return (
    <div style={{ background: '#f6f7f9', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginTop: 12 }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>TOTP 共享密钥（Base32）</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <code style={{ flex: 1, fontFamily: 'SF Mono, monospace', fontSize: 13, padding: '8px 10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, wordBreak: 'break-all' }}>{secret}</code>
        <button onClick={() => copy(secret)} style={miniBtn}>复制密钥</button>
      </div>

      <div style={{ fontSize: 11, color: '#6b7280', margin: '14px 0 6px' }}>otpauth:// 链接（可粘贴到 Authenticator）</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <code style={{ flex: 1, fontFamily: 'SF Mono, monospace', fontSize: 12, padding: '8px 10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, wordBreak: 'break-all', color: '#374151' }}>{url}</code>
        <button onClick={() => copy(url)} style={miniBtn}>复制链接</button>
      </div>

      <div style={{ marginTop: 14, padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
        <b>使用步骤：</b><br />
        1) 打开认证器 App → 添加账户 → 手动输入密钥 或 粘贴上面的 otpauth 链接<br />
        2) 验证：当前动态口令 = <b style={{ fontSize: 16, color: '#007aff', letterSpacing: 2 }}>{now}</b><br />
        3) 在下方输入这 6 位数字完成绑定（之后每次访问都输入 App 当前数字）
      </div>
    </div>
  );
}

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#f8fafc,#eef2ff 50%,#f5f3ff)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 440, background: '#fff', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(15,23,42,0.10), 0 4px 12px rgba(15,23,42,0.04)',
        padding: '36px 32px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 14px', borderRadius: 16,
            background: 'linear-gradient(135deg,#007aff,#5856d6)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: '0 8px 24px rgba(0,122,255,0.30)',
          }}>🔐</div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1d1d1f' }}>{title}</h1>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6, letterSpacing: 0.3 };
const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: 10, fontSize: 15, outline: 'none', background: '#fff' };
const btn: React.CSSProperties = { width: '100%', marginTop: 14, padding: '12px', background: 'linear-gradient(135deg,#006ee6,#0072ef 55%,#5856d6)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,114,239,0.30)' };
const miniBtn: React.CSSProperties = { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 12, cursor: 'pointer', color: '#374151', fontWeight: 600, whiteSpace: 'nowrap' };