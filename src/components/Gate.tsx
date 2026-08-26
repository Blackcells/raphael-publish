import { useEffect, useState } from 'react';
import {
  getDefaults,
  unlockWithPasswordAndTotp,
  loadStatus,
  lock,
  setOverride,
  clearOverride,
  otpauthUrl,
  generateTotp,
} from '../lib/secureGate';

export function Gate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState('');
  const [totp, setTotp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  const defaults = getDefaults();
  const [customPw, setCustomPw] = useState('');
  const [customSecret, setCustomSecret] = useState('');
  const [customSaved, setCustomSaved] = useState(false);

  useEffect(() => {
    // Bypass gate when running in test mode OR when ?gate=skip is set in URL
    const skip = (import.meta as any).env?.MODE === 'test'
      || new URLSearchParams(window.location.search).get('gate') === 'skip';
    if (skip) {
      setUnlocked(true);
      return;
    }
    setUnlocked(loadStatus().unlocked);
    // Auto-show help on first visit if there's no localStorage record
    if (!localStorage.getItem('raphael-gate-v1')) {
      setShowHelp(true);
    }
  }, []);

  async function onUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const ok = await unlockWithPasswordAndTotp(pw, totp);
    if (!ok) {
      setError('密码或动态口令错误（口令 30 秒一变，请确认未过期）');
      return;
    }
    setTotp(''); setPw('');
    setUnlocked(true);
  }

  function onLock() {
    lock();
    setUnlocked(false);
  }

  async function onSaveCustom(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!customPw || !customSecret) return;
    await setOverride(customPw, customSecret.trim());
    setCustomSaved(true);
    setTimeout(() => setCustomSaved(false), 2000);
  }

  function onClearCustom() {
    clearOverride();
    setCustomPw(''); setCustomSecret('');
    setCustomSaved(false);
  }

  // ---- Unlocked → show app, plus a tiny lock button -----------------------
  if (unlocked) {
    return (
      <>
        {children}
        <button
          onClick={onLock}
          title="锁定本浏览器"
          style={{
            position: 'fixed', bottom: 12, right: 12, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
            borderRadius: 999, padding: '6px 12px', fontSize: 11, cursor: 'pointer',
          }}
        >🔒 锁定</button>
      </>
    );
  }

  // ---- Locked → unlock form ------------------------------------------------
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
        <Header />
        <form onSubmit={onUnlock}>
          <label style={lbl}>密码</label>
          <input
            type="password" value={pw} onChange={(e) => setPw(e.target.value)}
            style={input} placeholder={defaults.password}
            autoComplete="current-password"
          />
          <label style={{ ...lbl, marginTop: 14 }}>动态口令（认证器 6 位数）</label>
          <input
            inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
            value={totp} onChange={(e) => setTotp(e.target.value.replace(/\D/g, ''))}
            style={{ ...input, fontSize: 28, letterSpacing: 12, textAlign: 'center', fontFamily: 'SF Mono, monospace' }}
            placeholder="000000" autoFocus
          />
          {error && <div style={{ color: '#ff3b30', fontSize: 13, marginTop: 8 }}>{error}</div>}
          <button type="submit" style={btn}>解锁</button>
        </form>

        <button
          type="button"
          onClick={() => setShowHelp(s => !s)}
          style={{ ...linkBtn, marginTop: 18 }}
        >
          {showHelp ? '收起 首次使用说明' : '首次使用？查看默认凭据 + 把密钥加入认证器'}
        </button>
        {showHelp && <HelpBlock secret={defaults.totpSecret} issuer={defaults.issuer} account={defaults.account} />}

        <button
          type="button"
          onClick={() => { setShowCustomize(s => !s); setCustomSaved(false); }}
          style={linkBtn}
        >
          {showCustomize ? '收起 自定义本浏览器凭据' : '为本浏览器设置独立密码 / 密钥（可选）'}
        </button>
        {showCustomize && (
          <CustomizeForm
            pw={customPw} setPw={setCustomPw}
            secret={customSecret} setSecret={setCustomSecret}
            onSave={onSaveCustom}
            onClear={onClearCustom}
            saved={customSaved}
          />
        )}
      </div>
    </div>
  );
}

// ---------- Sub-components ---------------------------------------------------

function Header() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <div style={{
        width: 56, height: 56, margin: '0 auto 14px', borderRadius: 16,
        background: 'linear-gradient(135deg,#007aff,#5856d6)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        boxShadow: '0 8px 24px rgba(0,122,255,0.30)',
      }}>🔐</div>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1d1d1f' }}>访问验证 · 2FA</h1>
      <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>
        输入默认密码 + 任意 TOTP 认证器（Google Authenticator / 1Password / Bitwarden）当前 6 位动态口令
      </p>
    </div>
  );
}

function HelpBlock({ secret, issuer, account }: { secret: string; issuer: string; account: string }) {
  const url = otpauthUrl(secret, account, issuer);
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
    <div style={{ background: '#f6f7f9', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginTop: 10 }}>
      <Row label="默认密码">
        <code style={codeChip}>Raphael2026!</code>
        <CopyBtn onClick={() => copy('Raphael2026!')} />
      </Row>
      <Row label="TOTP 共享密钥（Base32）">
        <code style={{ ...codeChip, flex: 1, wordBreak: 'break-all', fontSize: 12 }}>{secret}</code>
        <CopyBtn onClick={() => copy(secret)} />
      </Row>
      <Row label="otpauth:// 链接">
        <code style={{ ...codeChip, flex: 1, wordBreak: 'break-all', fontSize: 11, color: '#374151' }}>{url}</code>
        <CopyBtn onClick={() => copy(url)} />
      </Row>

      <div style={{ marginTop: 14, padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#374151', lineHeight: 1.7 }}>
        <b>首次使用步骤</b>（同一密钥在任何浏览器 / 任何设备都通用）：<br />
        1) 打开认证器 App → 添加账户 → <b>手动输入密钥</b>（或粘贴 otpauth 链接）<br />
        2) 验证：当前动态口令 = <b style={{ fontSize: 16, color: '#007aff', letterSpacing: 2 }}>{now}</b><br />
        3) 在上方输入密码 <code style={inlineCode}>Raphael2026!</code> 和 6 位动态口令即可解锁<br />
        4) 之后每次访问（任何浏览器 / 任何设备）都用同一套凭据
      </div>
    </div>
  );
}

function CustomizeForm({ pw, setPw, secret, setSecret, onSave, onClear, saved }: {
  pw: string; setPw: (s: string) => void;
  secret: string; setSecret: (s: string) => void;
  onSave: (e: React.FormEvent) => void;
  onClear: () => void;
  saved: boolean;
}) {
  return (
    <form onSubmit={onSave} style={{ background: '#fff8f0', border: '1px solid #fde68a', borderRadius: 12, padding: 16, marginTop: 10 }}>
      <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6, marginBottom: 10 }}>
        <b>仅本浏览器生效</b>：写入 localStorage 后，本浏览器解锁使用你设置的密码 / 密钥；其他浏览器不受影响，仍用默认值。删除本浏览器凭据可恢复默认。
      </div>
      <label style={lbl}>本浏览器密码</label>
      <input type="text" value={pw} onChange={(e) => setPw(e.target.value)} style={input} placeholder="（可任意设置）" />
      <label style={{ ...lbl, marginTop: 10 }}>本浏览器 TOTP 密钥</label>
      <input type="text" value={secret} onChange={(e) => setSecret(e.target.value.toUpperCase())} style={input} placeholder="Base32 编码的共享密钥" />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button type="submit" style={{ ...miniBtn, flex: 1, background: '#007aff', color: '#fff', border: 'none', fontWeight: 700 }}>{saved ? '✓ 已保存' : '保存为本浏览器凭据'}</button>
        <button type="button" onClick={onClear} style={miniBtn}>恢复默认</button>
      </div>
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{children}</div>
    </div>
  );
}

function CopyBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} style={miniBtn}>复制</button>;
}

// ---------- Styles ----------------------------------------------------------

const lbl: React.CSSProperties = { display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6, letterSpacing: 0.3 };
const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: 10, fontSize: 15, outline: 'none', background: '#fff' };
const btn: React.CSSProperties = { width: '100%', marginTop: 16, padding: '12px', background: 'linear-gradient(135deg,#006ee6,#0072ef 55%,#5856d6)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,114,239,0.30)' };
const linkBtn: React.CSSProperties = { display: 'block', width: '100%', marginTop: 12, padding: '8px', background: 'transparent', color: '#007aff', border: 'none', fontSize: 12, cursor: 'pointer', textAlign: 'center', textDecoration: 'underline' };
const miniBtn: React.CSSProperties = { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 12, cursor: 'pointer', color: '#374151', fontWeight: 600, whiteSpace: 'nowrap' };
const codeChip: React.CSSProperties = { fontFamily: 'SF Mono, monospace', fontSize: 13, padding: '8px 10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#1d1d1f' };
const inlineCode: React.CSSProperties = { fontFamily: 'SF Mono, monospace', fontSize: 11, padding: '1px 5px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, color: '#1d1d1f' };