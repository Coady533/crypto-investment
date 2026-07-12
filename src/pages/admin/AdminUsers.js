import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { mockApi } from '../../context/AuthContext';

const FLAG_MAP = {
  Nigeria: '🇳🇬', Germany: '🇩🇪', India: '🇮🇳', Brazil: '🇧🇷', Senegal: '🇸🇳',
  Ireland: '🇮🇪', 'South Korea': '🇰🇷', Mexico: '🇲🇽', Romania: '🇷🇴',
  UAE: '🇦🇪', Italy: '🇮🇹', Ghana: '🇬🇭', 'United States': '🇺🇸',
};

const timeAgo = (d) => {
  if (!d) return '—';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

const AdminUsers = () => {
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState('all');
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [modal,         setModal]         = useState(null);
  const [codeForm,      setCodeForm]      = useState({ authCode: '', policyCode: '' });
  const [balanceForm,   setBalanceForm]   = useState({ balance: '', totalInvested: '', totalProfit: '' });
  const [actionMsg,     setActionMsg]     = useState('');
  const [actionError,   setActionError]   = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [issuedCodes,   setIssuedCodes]   = useState(null);
  const [newBadge, setNewBadge] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const pendingOnly = filter === 'pending';
      const data = await mockApi.getAdminUsers(pendingOnly);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [filter]); // eslint-disable-line

  // ── Poll backend every 15s for real new pending users ──────────────────────
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const pending = await mockApi.getAdminUsers(true);
        setUsers(prev => {
          const prevIds   = new Set(prev.map(u => u._id));
          const freshOnes = pending.filter(u => !prevIds.has(u._id));
          if (freshOnes.length > 0) {
            setNewBadge(b => b + freshOnes.length);
            return [...freshOnes, ...prev];
          }
          return prev;
        });
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 15000);
    return () => clearInterval(poll);
  }, []); // eslint-disable-line

  const handleApprove = async (userId) => {
    try {
      await mockApi.approveUser(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, accountStatus: 'active' } : u));
    } catch (err) { alert(err?.response?.data?.message || 'Error'); }
  };

  const handleSuspend = async (userId) => {
    if (!window.confirm('Suspend this account?')) return;
    try {
      await mockApi.suspendUser(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, accountStatus: 'suspended' } : u));
    } catch (err) { alert(err?.response?.data?.message || 'Error'); }
  };

  const openCodesModal = (user) => {
    setSelectedUser(user); setCodeForm({ authCode: '', policyCode: '' });
    setIssuedCodes(null); setActionMsg(''); setActionError(''); setModal('codes');
  };
  const openBalanceModal = (user) => {
    setSelectedUser(user);
    setBalanceForm({ balance: user.balance, totalInvested: user.totalInvested, totalProfit: user.totalProfit });
    setActionMsg(''); setActionError(''); setModal('balance');
  };

  const handleIssueCodes = async (e) => {
    e.preventDefault(); setActionMsg(''); setActionError(''); setActionLoading(true);
    try {
      const res = await mockApi.issueCodes(selectedUser._id, codeForm);
      setIssuedCodes(res);
      setActionMsg('Codes issued! Share them with the user securely.');
    } catch (err) { setActionError(err?.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const handleBalanceUpdate = async (e) => {
    e.preventDefault(); setActionMsg(''); setActionError(''); setActionLoading(true);
    try {
      await mockApi.updateBalance(selectedUser._id, { balance: Number(balanceForm.balance), totalInvested: Number(balanceForm.totalInvested), totalProfit: Number(balanceForm.totalProfit) });
      setActionMsg('Balance updated.');
      setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, balance: Number(balanceForm.balance), totalInvested: Number(balanceForm.totalInvested), totalProfit: Number(balanceForm.totalProfit) } : u));
    } catch (err) { setActionError(err?.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
  const statusColor = { active: 'badge-success', pending: 'badge-warning', suspended: 'badge-danger' };

  const displayed = filter === 'all' ? users : users.filter(u => u.accountStatus === filter);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Approve accounts, manage balances, and issue security codes.</p>
        </div>
        <div className="page-content">

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {[['all', 'All Users', null], ['pending', 'Pending', users.filter(u => u.accountStatus === 'pending').length], ['active', 'Active', null], ['suspended', 'Suspended', null]].map(([val, label, count]) => (
              <button
                key={val}
                className={`btn btn-sm ${filter === val ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setFilter(val); setNewBadge(0); }}
                style={{ position: 'relative' }}
              >
                {label}
                {count > 0 && (
                  <span style={{ marginLeft: 6, background: 'var(--warning)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '1px 6px', borderRadius: 100 }}>
                    {count}
                  </span>
                )}
                {val === 'all' && newBadge > 0 && (
                  <span style={{ marginLeft: 6, background: 'var(--success)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '1px 6px', borderRadius: 100, animation: 'pulse 1.5s infinite' }}>
                    +{newBadge} new
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="card">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div>
            ) : displayed.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-text">No users found.</div></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Country</th>
                      <th>Balance</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((user, idx) => {
                      const isNew = user._id?.startsWith('live_') || user._id?.startsWith('sim_');
                      return (
                        <tr key={user._id || idx} style={{ background: isNew && user.accountStatus === 'pending' ? 'rgba(108,99,255,0.04)' : undefined }}>
                          <td>
                            <div className="table-user">
                              <div className="avatar" style={{ position: 'relative' }}>
                                {user.firstName?.[0]}{user.lastName?.[0]}
                                {isNew && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--success)', borderRadius: '50%', border: '2px solid var(--bg-primary)' }} />}
                              </div>
                              <div>
                                <div className="user-name">{user.firstName} {user.lastName}</div>
                                <div className="user-email">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{FLAG_MAP[user.country] || ''} {user.country || '—'}</td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(user.balance)}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>invested: {fmt(user.totalInvested)}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className={`badge ${statusColor[user.accountStatus] || 'badge-muted'}`}>{user.accountStatus}</span>
                              {isNew && <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>NEW</span>}
                            </div>
                          </td>
                          <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {user.createdAt ? timeAgo(user.createdAt) : '—'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {user.accountStatus === 'pending' && (
                                <button className="btn btn-success btn-sm" onClick={() => handleApprove(user._id)}>✓ Approve</button>
                              )}
                              {user.accountStatus === 'active' && (
                                <button className="btn btn-danger btn-sm" onClick={() => handleSuspend(user._id)}>Suspend</button>
                              )}
                              {user.accountStatus === 'suspended' && (
                                <button className="btn btn-success btn-sm" onClick={() => handleApprove(user._id)}>Reactivate</button>
                              )}
                              <button className="btn btn-secondary btn-sm" onClick={() => openCodesModal(user)}>🔑 Codes</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => openBalanceModal(user)}>💰 Balance</button>
                              <a href={`/admin/users/${user._id}`} className="btn btn-secondary btn-sm">👁 Details</a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Issue Codes Modal ── */}
      {modal === 'codes' && selectedUser && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <div className="modal-header">
              <h2 className="modal-title">🔑 Issue Security Codes</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{selectedUser.firstName} {selectedUser.lastName} — {selectedUser.email}</p>
            </div>
            {actionMsg   && <div className="alert alert-success">{actionMsg}</div>}
            {actionError && <div className="alert alert-error">{actionError}</div>}
            {issuedCodes ? (
              <div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 16 }}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>AUTHENTICATION CODE</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.1em' }}>{issuedCodes.authCode}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>POLICY CODE</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '0.1em' }}>{issuedCodes.policyCode}</div>
                  </div>
                </div>
                <div className="alert alert-warning">⚠️ Share these codes with the user via a secure channel. They expire once used.</div>
                <button className="btn btn-secondary btn-full" onClick={() => setModal(null)}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleIssueCodes}>
                <div className="alert alert-info">Leave fields blank to auto-generate codes, or enter custom codes below.</div>
                <div className="form-group">
                  <label className="form-label">Authentication Code (optional)</label>
                  <input type="text" className="form-input" placeholder="Auto-generate if empty" value={codeForm.authCode} onChange={e => setCodeForm({ ...codeForm, authCode: e.target.value })} style={{ fontFamily: 'monospace' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Policy Code (optional)</label>
                  <input type="text" className="form-input" placeholder="Auto-generate if empty" value={codeForm.policyCode} onChange={e => setCodeForm({ ...codeForm, policyCode: e.target.value })} style={{ fontFamily: 'monospace' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>{actionLoading ? 'Issuing...' : 'Issue Codes'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Balance Modal ── */}
      {modal === 'balance' && selectedUser && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <div className="modal-header">
              <h2 className="modal-title">💰 Adjust Balance</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{selectedUser.firstName} {selectedUser.lastName}</p>
            </div>
            {actionMsg   && <div className="alert alert-success">{actionMsg}</div>}
            {actionError && <div className="alert alert-error">{actionError}</div>}
            <form onSubmit={handleBalanceUpdate}>
              <div className="form-group">
                <label className="form-label">Balance (USD)</label>
                <input type="number" className="form-input" step="0.01" min="0" value={balanceForm.balance} onChange={e => setBalanceForm({ ...balanceForm, balance: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Total Invested</label>
                <input type="number" className="form-input" step="0.01" min="0" value={balanceForm.totalInvested} onChange={e => setBalanceForm({ ...balanceForm, totalInvested: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Total Profit</label>
                <input type="number" className="form-input" step="0.01" value={balanceForm.totalProfit} onChange={e => setBalanceForm({ ...balanceForm, totalProfit: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Update Balance'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
