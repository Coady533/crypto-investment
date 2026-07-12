import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../context/AuthContext';

const EXPERTS = [
  {
    id: 'exp_01', name: 'Alex Morgan',     flag: '🇺🇸', country: 'USA',
    avatar: 'AM', specialty: 'BTC/ETH',
    roi30d: 34.2, roi90d: 89.5, winRate: 78, followers: 1240,
    monthlyFee: 49, minCopy: 500,
    badge: '🏆', badgeLabel: 'Top Trader',
    bio: '8 years in crypto trading. Specializes in BTC swing trading and ETH DeFi opportunities.',
    trades: 342, color: '#f7931a'
  },
  {
    id: 'exp_02', name: 'Yuki Tanaka',     flag: '🇯🇵', country: 'Japan',
    avatar: 'YT', specialty: 'Altcoins',
    roi30d: 28.7, roi90d: 71.3, winRate: 72, followers: 876,
    monthlyFee: 35, minCopy: 250,
    badge: '⭐', badgeLabel: 'Verified',
    bio: 'Altcoin specialist with focus on emerging DeFi tokens and yield farming strategies.',
    trades: 215, color: '#627eea'
  },
  {
    id: 'exp_03', name: 'Sofia Reyes',     flag: '🇧🇷', country: 'Brazil',
    avatar: 'SR', specialty: 'BNB/USDT',
    roi30d: 41.6, roi90d: 102.4, winRate: 81, followers: 2103,
    monthlyFee: 79, minCopy: 1000,
    badge: '💎', badgeLabel: 'Elite',
    bio: 'Former hedge fund analyst. Consistently top-performing trader on the platform for 2 years.',
    trades: 521, color: '#22c55e'
  },
  {
    id: 'exp_04', name: 'Ibrahim Hassan',  flag: '🇦🇪', country: 'UAE',
    avatar: 'IH', specialty: 'BTC/BNB',
    roi30d: 22.1, roi90d: 58.9, winRate: 69, followers: 634,
    monthlyFee: 25, minCopy: 100,
    badge: '✅', badgeLabel: 'Verified',
    bio: 'Conservative trading approach focused on capital preservation and steady returns.',
    trades: 178, color: '#f3ba2f'
  },
];

const CopyTradingPage = () => {
  const { user, refreshUser } = useAuth();
  const [selected,  setSelected]  = useState(null);
  const [modal,     setModal]     = useState(false);
  const [copyAmt,   setCopyAmt]   = useState('');
  const [success,   setSuccess]   = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all | active

  const activeCopies = user?.activeCopyTrades || [];

  const fmt       = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
  const fmtPct    = n => `${n > 0 ? '+' : ''}${n}%`;

  const openModal = (expert) => {
    setSelected(expert);
    setCopyAmt('');
    setError('');
    setSuccess('');
    setModal(true);
  };

  const handleCopy = async e => {
    e.preventDefault(); setError('');
    const amt = Number(copyAmt);
    if (!amt || amt <= 0)                 return setError('Please enter a valid amount');
    if (amt < selected.minCopy)           return setError(`Minimum copy amount for ${selected.name} is ${fmt(selected.minCopy)}`);
    if (amt + selected.monthlyFee > (user?.balance || 0))
                                          return setError(`Insufficient balance. You need ${fmt(amt + selected.monthlyFee)} (amount + ${fmt(selected.monthlyFee)} fee)`);
    setLoading(true);
    try {
      await mockApi.submitDeposit({
        amount:      selected.monthlyFee,
        cryptoType:  'USD',
        description: `Copy Trading Fee — ${selected.name} (${selected.specialty})`
      });
      setSuccess(`You are now copying ${selected.name}! Your ${fmt(amt)} will mirror their trades. Monthly fee of ${fmt(selected.monthlyFee)} has been deducted.`);
      await refreshUser();
      setTimeout(() => { setModal(false); setSuccess(''); }, 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start copy trading');
    } finally { setLoading(false); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Copy Trading 📊</h1>
          <p className="page-subtitle">Mirror the trades of top-performing experts automatically.</p>
        </div>
        <div className="page-content">

          {/* How it works */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 14, fontSize: '1rem' }}>
              How Copy Trading Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12 }}>
              {[
                ['1️⃣', 'Choose an Expert', 'Browse verified traders by ROI, win rate, and specialty'],
                ['2️⃣', 'Pay Monthly Fee',  'A one-time monthly subscription fee is deducted from your balance'],
                ['3️⃣', 'Set Copy Amount',  'Allocate funds to mirror — trades are copied proportionally'],
                ['4️⃣', 'Earn Together',    'Profits reflect in your account automatically each trade'],
              ].map(([icon, title, desc], i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[['all', 'All Experts'], ['active', `My Copies (${activeCopies.length})`]].map(([val, label]) => (
              <button key={val} className={`btn btn-sm ${activeTab === val ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(val)}>
                {label}
              </button>
            ))}
          </div>

          {/* Experts Grid */}
          {activeTab === 'all' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 20 }}>
              {EXPERTS.map(expert => (
                <div key={expert.id} className="card" style={{ borderTop: `3px solid ${expert.color}` }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${expert.color}22`, border: `2px solid ${expert.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: expert.color, flexShrink: 0 }}>
                      {expert.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800 }}>{expert.name}</span>
                        <span style={{ fontSize: '0.85rem' }}>{expert.flag}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{expert.specialty} · {expert.followers.toLocaleString()} followers</div>
                    </div>
                    <span className="badge badge-accent" style={{ fontSize: '0.68rem' }}>{expert.badge} {expert.badgeLabel}</span>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {[
                      ['30d ROI', fmtPct(expert.roi30d), 'var(--success)'],
                      ['90d ROI', fmtPct(expert.roi90d), 'var(--success)'],
                      ['Win Rate', `${expert.winRate}%`, expert.color],
                    ].map(([k, v, c]) => (
                      <div key={k} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '8px 6px', textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '0.9rem', color: c }}>{v}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{k}</div>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>{expert.bio}</p>

                  {/* Fee info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Monthly Fee</div>
                      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, color: expert.color }}>{fmt(expert.monthlyFee)}/mo</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Min. Copy Amount</div>
                      <div style={{ fontWeight: 700 }}>{fmt(expert.minCopy)}</div>
                    </div>
                  </div>

                  <button className="btn btn-primary btn-full" style={{ background: expert.color, borderColor: expert.color }} onClick={() => openModal(expert)}>
                    Copy {expert.name.split(' ')[0]} →
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'active' && (
            activeCopies.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <div className="empty-state-text">You are not copying any traders yet.</div>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setActiveTab('all')}>
                    Browse Experts →
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeCopies.map((c, i) => (
                  <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.expertName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Copying since {new Date(c.startDate).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800 }}>{fmt(c.amount)}</div>
                    <span className="badge badge-success">Active</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* ── Copy Modal ── */}
      {modal && selected && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            <div className="modal-header">
              <h2 className="modal-title">Copy {selected.name}</h2>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                {selected.flag} {selected.country} · {selected.specialty} · {selected.winRate}% win rate
              </p>
            </div>

            {success && <div className="alert alert-success">{success}</div>}
            {error   && <div className="alert alert-error">{error}</div>}

            {!success && (
              <form onSubmit={handleCopy}>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Monthly Fee</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(selected.monthlyFee)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Min. Copy Amount</span>
                    <span style={{ fontWeight: 700 }}>{fmt(selected.minCopy)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Your Balance</span>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>{fmt(user?.balance)}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount to Copy ($)</label>
                  <input
                    type="number" className="form-input"
                    placeholder={`Min. ${fmt(selected.minCopy)}`}
                    value={copyAmt}
                    onChange={e => { setCopyAmt(e.target.value); setError(''); }}
                    min={selected.minCopy} step="0.01" required
                  />
                  {copyAmt && Number(copyAmt) >= selected.minCopy && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                      Total deducted: <strong style={{ color: 'var(--text-primary)' }}>{fmt(Number(copyAmt) + selected.monthlyFee)}</strong>
                      {' '}(copy amount + monthly fee)
                    </div>
                  )}
                </div>

                <div className="alert alert-info" style={{ marginBottom: 16 }}>
                  ℹ️ The monthly fee of <strong>{fmt(selected.monthlyFee)}</strong> will be charged immediately and renewed monthly. You can cancel anytime.
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                  {loading ? 'Processing...' : `Start Copying ${selected.name.split(' ')[0]}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyTradingPage;
