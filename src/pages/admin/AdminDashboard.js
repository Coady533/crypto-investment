import React, { useEffect, useState, useRef, useCallback } from 'react'; // useRef kept for notifRef
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { mockApi } from '../../context/AuthContext';

const FLAG_MAP = {
  Nigeria: '🇳🇬', Germany: '🇩🇪', India: '🇮🇳', Brazil: '🇧🇷', Senegal: '🇸🇳',
  Ireland: '🇮🇪', 'South Korea': '🇰🇷', Mexico: '🇲🇽', 'United States': '🇺🇸',
  'United Kingdom': '🇬🇧', UAE: '🇦🇪', Italy: '🇮🇹', Ghana: '🇬🇭',
  Romania: '🇷🇴', Australia: '🇦🇺', Canada: '🇨🇦', France: '🇫🇷',
  Singapore: '🇸🇬', Japan: '🇯🇵', Spain: '🇪🇸', 'South Africa': '🇿🇦',
};

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

const AdminDashboard = () => {
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [newSignups, setNewSignups]   = useState([]);   // real-time feed
  const [notifBadge, setNotifBadge]   = useState(0);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [allUsers, setAllUsers]       = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const notifRef = useRef(null);

  const loadData = useCallback(async () => {
    const [s, users, pending] = await Promise.all([
      mockApi.getAdminStats(),
      mockApi.getAdminUsers(false),
      mockApi.getAdminUsers(true),
    ]);
    setStats(s);
    setAllUsers(users);
    setPendingUsers(pending);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Poll backend every 15s for real new pending users ──────────────────────
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const pending = await mockApi.getAdminUsers(true);
        setPendingUsers(prevPending => {
          // Detect genuinely new pending users (not seen before)
          const prevIds = new Set(prevPending.map(u => u._id));
          const freshOnes = pending.filter(u => !prevIds.has(u._id));
          if (freshOnes.length > 0) {
            setNewSignups(prev => [...freshOnes, ...prev].slice(0, 8));
            setNotifBadge(b => b + freshOnes.length);
          }
          return pending;
        });
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 15000);
    return () => clearInterval(poll);
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleApprove = async (userId) => {
    await mockApi.approveUser(userId);
    setPendingUsers(prev => prev.filter(u => u._id !== userId));
    setNewSignups(prev  => prev.map(u => u._id === userId ? { ...u, accountStatus: 'active' } : u));
    const freshStats = await mockApi.getAdminStats();
    setStats(freshStats);
  };

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">

        {/* ── Top bar with notification bell ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '16px 32px 0', gap: 12 }}>
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setNotifOpen(o => !o); setNotifBadge(0); }}
              style={{
                position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '9px 14px',
                color: 'var(--text-primary)', fontSize: '1.1rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              🔔
              {notifBadge > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: 'var(--danger)', color: '#fff',
                  fontSize: '0.65rem', fontWeight: 800,
                  width: 18, height: 18, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg-primary)', animation: 'pulse 1.5s infinite'
                }}>
                  {notifBadge > 9 ? '9+' : notifBadge}
                </span>
              )}
            </button>

            {/* Notification panel */}
            {notifOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                width: 340, background: 'var(--bg-card)',
                border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)', zIndex: 500, overflow: 'hidden',
                animation: 'fadeUp 0.2s ease'
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>🔔 New Registrations</span>
                  <Link to="/admin/users" style={{ fontSize: '0.78rem', color: 'var(--accent)' }} onClick={() => setNotifOpen(false)}>View all</Link>
                </div>
                {newSignups.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No new signups yet</div>
                ) : (
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {newSignups.map((u, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                        borderBottom: '1px solid var(--border)', background: i === 0 ? 'var(--accent-light)' : undefined
                      }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}>
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {FLAG_MAP[u.country] || '🌍'} {u.firstName} {u.lastName}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{timeAgo(u.createdAt)}</div>
                          {u.accountStatus !== 'active' ? (
                            <button
                              className="btn btn-success btn-sm"
                              style={{ padding: '3px 10px', fontSize: '0.7rem' }}
                              onClick={() => handleApprove(u._id)}
                            >
                              Approve
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>✓ Active</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="page-header" style={{ paddingTop: 12 }}>
          <h1 className="page-title">Admin Overview 🛡</h1>
          <p className="page-subtitle">Manage users, transactions, and platform operations.</p>
        </div>

        <div className="page-content">
          {loading ? (
            <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
          ) : (
            <>
              {/* ── Stats ── */}
              <div className="stats-grid" style={{ marginBottom: 28 }}>
                {[
                  { label: '👥 Total Users',          val: stats?.totalUsers || 0,       color: undefined },
                  { label: '⏳ Pending Approval',      val: stats?.pendingUsers || 0,     color: stats?.pendingUsers > 0 ? 'var(--warning)' : undefined },
                  { label: '✅ Active Users',           val: stats?.activeUsers || 0,      color: 'var(--success)' },
                  { label: '🔔 Pending Transactions',  val: (stats?.pendingTransactions || 0) + (stats?.codeRequiredTransactions || 0), color: ((stats?.pendingTransactions || 0) + (stats?.codeRequiredTransactions || 0)) > 0 ? 'var(--warning)' : undefined },
                  { label: '💰 Total Deposits',        val: fmt(stats?.totalDeposits),    color: 'var(--success)', small: true },
                  { label: '💸 Total Withdrawals',     val: fmt(stats?.totalWithdrawals), color: undefined, small: true },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-card-label">{s.label}</div>
                    <div className="stat-card-value" style={{ color: s.color, fontSize: s.small ? '1.3rem' : undefined }}>{s.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* ── Quick Actions ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { to: '/admin/users',        icon: '👥', title: 'User Management',     desc: 'Approve accounts, manage balances, issue security codes.', badge: stats?.pendingUsers > 0 ? `${stats.pendingUsers} pending` : null, badgeCls: 'badge-warning' },
                    { to: '/admin/transactions', icon: '📋', title: 'Transactions',         desc: 'Approve deposits, process withdrawals, review code-verified requests.', badge: (stats?.pendingTransactions + stats?.codeRequiredTransactions) > 0 ? `${(stats?.pendingTransactions || 0) + (stats?.codeRequiredTransactions || 0)} need action` : null, badgeCls: 'badge-warning' },
                    { to: '/admin/plans',        icon: '📈', title: 'Investment Plans',     desc: 'Create, edit, and manage all investment plan tiers.', badge: null },
                  ].map(card => (
                    <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
                      <div className="card card-hover" style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ fontSize: '1.8rem' }}>{card.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 3 }}>{card.title}</div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>{card.desc}</p>
                          </div>
                          {card.badge && <span className={`badge ${card.badgeCls}`}>{card.badge}</span>}
                          <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>›</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* ── Pending Approvals panel ── */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                      ⏳ Pending Accounts
                    </h2>
                    <Link to="/admin/users" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>View all</Link>
                  </div>

                  {pendingUsers.length === 0 ? (
                    <div className="empty-state" style={{ padding: '24px 0' }}>
                      <div className="empty-state-icon" style={{ fontSize: '1.8rem' }}>✅</div>
                      <div className="empty-state-text">All accounts are approved.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
                      {pendingUsers.slice(0, 6).map((u, i) => (
                        <div key={u._id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}>{u.firstName[0]}{u.lastName[0]}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {FLAG_MAP[u.country] || ''} {u.firstName} {u.lastName}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.email} · {u.createdAt ? timeAgo(u.createdAt) : 'recently'}
                            </div>
                          </div>
                          <button
                            className="btn btn-success btn-sm"
                            style={{ padding: '5px 12px', fontSize: '0.78rem', flexShrink: 0 }}
                            onClick={() => handleApprove(u._id)}
                          >
                            ✓ Approve
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
