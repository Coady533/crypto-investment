import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../context/AuthContext';

const MyInvestmentsPage = () => {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    refreshUser();
    mockApi.getPlans().then(setPlans);
    // eslint-disable-next-line
  }, []);

  const investments = user?.activeInvestments || [];
  const filtered = filter === 'all' ? investments : investments.filter(i => i.status === filter);

  const getPlan = (planId) => plans.find(p => p.id === planId) || {};

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  const daysLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    return diff > 0 ? Math.ceil(diff / 86400000) : 0;
  };
  const daysElapsed = (startDate) => Math.floor((new Date() - new Date(startDate)) / 86400000);
  const progress = (startDate, endDate) => {
    const total = new Date(endDate) - new Date(startDate);
    const elapsed = new Date() - new Date(startDate);
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const totalInvested = investments.filter(i => i.status === 'active').reduce((s, i) => s + i.amount, 0);
  const totalEarned   = investments.reduce((s, i) => s + (i.earned || 0), 0);
  const totalExpected = investments.filter(i => i.status === 'active').reduce((s, i) => s + (i.amount * i.roi / 100), 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Investments 💼</h1>
          <p className="page-subtitle">Track your active plans, earnings, and maturity dates.</p>
        </div>
        <div className="page-content">

          {/* Summary stats */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-card-label">Active Investments</div>
              <div className="stat-card-value accent">{investments.filter(i => i.status === 'active').length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Funds in Plans</div>
              <div className="stat-card-value">{fmt(totalInvested)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Total Earned</div>
              <div className="stat-card-value success">{fmt(totalEarned)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Expected Returns</div>
              <div className="stat-card-value" style={{ color: 'var(--gold)' }}>{fmt(totalExpected)}</div>
            </div>
          </div>

          {/* Filter + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all','active','completed'].map(f => (
                <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
              ))}
            </div>
            <Link to="/invest" className="btn btn-primary btn-sm">+ New Investment</Link>
          </div>

          {filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">💼</div>
                <div className="empty-state-text">No {filter !== 'all' ? filter : ''} investments yet.</div>
                <Link to="/invest" className="btn btn-primary" style={{ marginTop: 16 }}>Start Investing →</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map((inv, i) => {
                const plan   = getPlan(inv.planId);
                const prog   = progress(inv.startDate, inv.endDate);
                const left   = daysLeft(inv.endDate);
                const elapsed = daysElapsed(inv.startDate);
                const projProfit = (inv.amount * inv.roi) / 100;
                const earned = inv.status === 'completed' ? projProfit : (projProfit * prog / 100);

                return (
                  <div key={i} className="card" style={{ borderLeft: `3px solid ${plan.color || 'var(--accent)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ fontSize: '2rem' }}>{plan.badge || '💼'}</div>
                        <div>
                          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.05rem', color: plan.color || 'var(--accent)' }}>
                            {inv.planName} Plan
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {new Date(inv.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {' → '}
                            {new Date(inv.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${inv.status === 'active' ? 'badge-success' : 'badge-muted'}`} style={{ fontSize: '0.78rem' }}>
                        {inv.status === 'active' ? '🟢 Active' : '✓ Completed'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 12, marginBottom: 16 }}>
                      {[
                        ['Invested',        fmt(inv.amount),      'var(--text-primary)'],
                        ['ROI',             `${inv.roi}%`,        plan.color || 'var(--accent)'],
                        ['Earned So Far',   fmt(earned),          'var(--success)'],
                        ['Expected Profit', fmt(projProfit),      'var(--gold)'],
                      ].map(([label, val, color], j) => (
                        <div key={j} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1rem', color }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                        <span>{inv.status === 'active' ? `Day ${elapsed} of ${plan.durationDays || '?'}` : 'Completed'}</span>
                        <span>{inv.status === 'active' ? `${left} day${left !== 1 ? 's' : ''} left` : '100%'}</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${inv.status === 'completed' ? 100 : prog}%`,
                          background: inv.status === 'completed' ? 'var(--success)' : (plan.color || 'var(--accent)'),
                          borderRadius: 100, transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyInvestmentsPage;
