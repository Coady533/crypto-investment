import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { mockApi } from '../../context/AuthContext';

const AdminUserDetail = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [user,      setUser]      = useState(null);
  const [txs,       setTxs]       = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('overview');
  const [toast,     setToast]     = useState('');
  const [modal,     setModal]     = useState(null);
  const [issuedCodes, setIssuedCodes] = useState(null);
  const [codeForm,  setCodeForm]  = useState({ authCode: '', policyCode: '' });
  const [balForm,   setBalForm]   = useState({ balance: '', totalInvested: '', totalProfit: '' });
  const [saving,    setSaving]    = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const load = async () => {
      try {
        const users = await mockApi.getAdminUsers(false);
        const found = users.find(u => u._id === id);
        if (!found) { navigate('/admin/users'); return; }
        setUser(found);
        setBalForm({ balance: found.balance, totalInvested: found.totalInvested, totalProfit: found.totalProfit });
        const allTx = await mockApi.getAdminTransactions({});
        setTxs(allTx.filter(t => t.user?._id === id || t.user === id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleApprove  = async () => { await mockApi.approveUser(id); setUser(u => ({ ...u, accountStatus: 'active' }));    showToast('Account approved'); };
  const handleSuspend  = async () => { await mockApi.suspendUser(id); setUser(u => ({ ...u, accountStatus: 'suspended' })); showToast('Account suspended'); };

  const handleIssueCodes = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await mockApi.issueCodes(id, codeForm);
      setIssuedCodes(res);
      showToast('Codes issued successfully');
    } catch (err) { alert(err?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleBalanceUpdate = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await mockApi.updateBalance(id, {
        balance:       Number(balForm.balance),
        totalInvested: Number(balForm.totalInvested),
        totalProfit:   Number(balForm.totalProfit),
      });
      setUser(u => ({ ...u, balance: Number(balForm.balance), totalInvested: Number(balForm.totalInvested), totalProfit: Number(balForm.totalProfit) }));
      showToast('Balance updated');
      setModal(null);
    } catch (err) { alert(err?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
  const statusColor = { active: 'var(--success)', pending: 'var(--warning)', suspended: 'var(--danger)' };
  const STATUS_TX   = { pending: 'badge-warning', completed: 'badge-success', rejected: 'badge-danger', code_required: 'badge-accent', codes_submitted: 'badge-accent' };

  if (loading) return <div className="app-layout"><Sidebar /><main className="main-content"><div className="loading-screen"><div className="spinner" /></div></main></div>;
  if (!user)   return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/users')}>← Back</button>
            <div>
              <h1 className="page-title" style={{ marginBottom: 0 }}>User Details</h1>
              <p className="page-subtitle">Full profile and activity for {user.firstName} {user.lastName}</p>
            </div>
          </div>
        </div>

        <div className="page-content">

          {/* ── Profile Header Card ── */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-light)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.3rem' }}>{user.firstName} {user.lastName}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 6 }}>{user.email}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-accent">{user.role}</span>
                    <span className="badge" style={{ background: `${statusColor[user.accountStatus]}22`, color: statusColor[user.accountStatus] }}>
                      {user.accountStatus}
                    </span>
                    {user.kycStatus && <span className="badge badge-muted">KYC: {user.kycStatus}</span>}
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {user.accountStatus === 'pending'   && <button className="btn btn-success btn-sm" onClick={handleApprove}>✓ Approve</button>}
                {user.accountStatus === 'active'    && <button className="btn btn-danger btn-sm"  onClick={handleSuspend}>Suspend</button>}
                {user.accountStatus === 'suspended' && <button className="btn btn-success btn-sm" onClick={handleApprove}>Reactivate</button>}
                <button className="btn btn-secondary btn-sm" onClick={() => { setIssuedCodes(null); setModal('codes'); }}>🔑 Issue Codes</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setModal('balance')}>💰 Edit Balance</button>
              </div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card"><div className="stat-card-label">Balance</div><div className="stat-card-value">{fmt(user.balance)}</div></div>
            <div className="stat-card"><div className="stat-card-label">Total Invested</div><div className="stat-card-value accent">{fmt(user.totalInvested)}</div></div>
            <div className="stat-card"><div className="stat-card-label">Total Profit</div><div className="stat-card-value success">{fmt(user.totalProfit)}</div></div>
            <div className="stat-card"><div className="stat-card-label">Transactions</div><div className="stat-card-value">{txs.length}</div></div>
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[['overview', 'Overview'], ['transactions', 'Transactions'], ['security', 'Security Codes']].map(([val, label]) => (
              <button key={val} className={`btn btn-sm ${tab === val ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(val)}>{label}</button>
            ))}
          </div>

          {/* ── Overview Tab ── */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Personal Info */}
              <div className="card">
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Personal Information</h3>
                {[
                  ['First Name',    user.firstName],
                  ['Last Name',     user.lastName],
                  ['Email',         user.email],
                  ['Phone',         user.phone        || '—'],
                  ['Country',       user.country      || '—'],
                  ['KYC Status',    user.kycStatus    || '—'],
                  ['Role',          user.role],
                  ['Account Status',user.accountStatus],
                  ['Member Since',  new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Financial Info */}
              <div className="card">
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Financial Overview</h3>
                {[
                  ['Available Balance', fmt(user.balance),        'var(--text-primary)'],
                  ['Total Invested',    fmt(user.totalInvested),   'var(--accent)'],
                  ['Total Profit',      fmt(user.totalProfit),     'var(--success)'],
                  ['Total Deposits',    fmt(txs.filter(t => t.type === 'deposit'    && t.status === 'completed').reduce((s, t) => s + t.amount, 0)), 'var(--success)'],
                  ['Total Withdrawals', fmt(txs.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((s, t) => s + t.amount, 0)), 'var(--danger)'],
                  ['Pending Transactions', txs.filter(t => t.status === 'pending').length, 'var(--warning)'],
                ].map(([k, v, c]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 700, color: c }}>{v}</span>
                  </div>
                ))}

                {/* Portfolio */}
                {user.portfolio && (
                  <>
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, margin: '16px 0 10px', fontSize: '0.9rem' }}>Portfolio Holdings</h3>
                    {Object.entries(user.portfolio).map(([coin, amt]) => (
                      <div key={coin} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{coin}</span>
                        <span style={{ fontWeight: 600 }}>{Number(amt).toFixed(6)}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Transactions Tab ── */}
          {tab === 'transactions' && (
            <div className="card">
              {txs.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No transactions yet.</div></div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Type</th><th>Amount</th><th>Currency</th><th>Status</th><th>Note</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {txs.map(tx => (
                        <tr key={tx._id}>
                          <td>
                            <span style={{ textTransform: 'capitalize', fontWeight: 600, color: tx.type === 'deposit' ? 'var(--success)' : 'var(--danger)' }}>
                              {tx.type === 'deposit' ? '↓' : '↑'} {tx.type}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: tx.type === 'deposit' ? 'var(--success)' : 'var(--danger)' }}>
                            {tx.type === 'deposit' ? '+' : '-'}{fmt(tx.amount)}
                          </td>
                          <td><span className="badge badge-muted">{tx.cryptoType}</span></td>
                          <td><span className={`badge ${STATUS_TX[tx.status] || 'badge-muted'}`}>{tx.status}</span></td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.adminNote || tx.description || '—'}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Security Tab ── */}
          {tab === 'security' && (
            <div style={{ maxWidth: 520 }}>
              <div className="card">
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 16 }}>Issue Security Codes</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                  Generate and send Authentication and Policy codes to this user for withdrawal verification. Leave fields blank to auto-generate.
                </p>
                {issuedCodes ? (
                  <div>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 16 }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>AUTHENTICATION CODE</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.12em' }}>{issuedCodes.authCode}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>POLICY CODE</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '0.12em' }}>{issuedCodes.policyCode}</div>
                      </div>
                    </div>
                    <div className="alert alert-warning">⚠️ Share these codes with the user via a secure channel (email or SMS). They are required for withdrawal.</div>
                    <button className="btn btn-secondary" onClick={() => { setIssuedCodes(null); setCodeForm({ authCode: '', policyCode: '' }); }}>Generate New Codes</button>
                  </div>
                ) : (
                  <form onSubmit={handleIssueCodes}>
                    <div className="form-group">
                      <label className="form-label">Custom Auth Code (optional)</label>
                      <input type="text" className="form-input" placeholder="Auto-generate if blank" value={codeForm.authCode} onChange={e => setCodeForm({ ...codeForm, authCode: e.target.value })} style={{ fontFamily: 'monospace' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Custom Policy Code (optional)</label>
                      <input type="text" className="form-input" placeholder="Auto-generate if blank" value={codeForm.policyCode} onChange={e => setCodeForm({ ...codeForm, policyCode: e.target.value })} style={{ fontFamily: 'monospace' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Generating...' : '🔑 Issue Codes'}</button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Balance Modal ── */}
      {modal === 'balance' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <div className="modal-header"><h2 className="modal-title">💰 Edit Balance</h2></div>
            <form onSubmit={handleBalanceUpdate}>
              <div className="form-group"><label className="form-label">Balance (USD)</label><input type="number" className="form-input" step="0.01" value={balForm.balance} onChange={e => setBalForm({ ...balForm, balance: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Total Invested</label><input type="number" className="form-input" step="0.01" value={balForm.totalInvested} onChange={e => setBalForm({ ...balForm, totalInvested: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Total Profit</label><input type="number" className="form-input" step="0.01" value={balForm.totalProfit} onChange={e => setBalForm({ ...balForm, totalProfit: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Update Balance'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Issue Codes Modal ── */}
      {modal === 'codes' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <div className="modal-header"><h2 className="modal-title">🔑 Issue Security Codes</h2></div>
            {issuedCodes ? (
              <div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 16 }}>
                  <div style={{ marginBottom: 14 }}><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>AUTH CODE</div><div style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.1em' }}>{issuedCodes.authCode}</div></div>
                  <div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>POLICY CODE</div><div style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '0.1em' }}>{issuedCodes.policyCode}</div></div>
                </div>
                <div className="alert alert-warning">⚠️ Share these securely with the user.</div>
                <button className="btn btn-secondary btn-full" onClick={() => setModal(null)}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleIssueCodes}>
                <div className="alert alert-info">Leave blank to auto-generate codes.</div>
                <div className="form-group"><label className="form-label">Auth Code (optional)</label><input type="text" className="form-input" placeholder="Auto-generate" value={codeForm.authCode} onChange={e => setCodeForm({ ...codeForm, authCode: e.target.value })} style={{ fontFamily: 'monospace' }} /></div>
                <div className="form-group"><label className="form-label">Policy Code (optional)</label><input type="text" className="form-input" placeholder="Auto-generate" value={codeForm.policyCode} onChange={e => setCodeForm({ ...codeForm, policyCode: e.target.value })} style={{ fontFamily: 'monospace' }} /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Issuing...' : 'Issue Codes'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--success)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.88rem', zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', animation: 'fadeUp 0.3s ease' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
};

export default AdminUserDetail;
