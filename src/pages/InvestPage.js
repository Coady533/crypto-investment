import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../context/AuthContext';

const InvestPage = () => {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount]     = useState('');
  const [crypto, setCrypto]     = useState('USDT');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refreshUser();
    mockApi.getPlans().then(p => { setPlans(p); setLoading(false); });
    // eslint-disable-next-line
  }, []);

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  const handleInvest = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const amt = Number(amount);
    if (!selected) return setError('Please select a plan first');
    if (!amt || amt <= 0) return setError('Please enter a valid amount');
    if (amt > (user?.balance || 0)) return setError('Insufficient balance. Please deposit first.');
    setSubmitting(true);
    try {
      const res = await mockApi.investInPlan({ planId: selected.id, amount: amt, cryptoType: crypto });
      setSuccess(res.message);
      setAmount('');
      setSelected(null);
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Investment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const projectedProfit = selected && amount
    ? ((Number(amount) * selected.roiPercent) / 100).toFixed(2)
    : null;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Invest 📈</h1>
          <p className="page-subtitle">Choose a plan and allocate funds from your account balance.</p>
        </div>
        <div className="page-content">

          {/* Balance reminder */}
          <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>AVAILABLE BALANCE</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.8rem', fontWeight: 800 }}>{fmt(user?.balance)}</div>
            </div>
            <a href="/deposit" className="btn btn-secondary btn-sm">+ Add Funds</a>
          </div>

          {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}
          {error   && <div className="alert alert-error"   style={{ marginBottom: 20 }}>{error}</div>}

          {/* Plan selection */}
          {loading ? (
            <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>
          ) : (
            <>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>1. Select a Plan</h2>
              <div className="plans-grid" style={{ marginBottom: 32 }}>
                {plans.map(plan => {
                  const isSelected = selected?.id === plan.id;
                  const canAfford  = (user?.balance || 0) >= plan.minDeposit;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => canAfford && setSelected(isSelected ? null : plan)}
                      className={`plan-card ${plan.highlight ? 'plan-card--highlight' : ''}`}
                      style={{
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        opacity: canAfford ? 1 : 0.45,
                        border: isSelected ? `2px solid ${plan.color}` : undefined,
                        boxShadow: isSelected ? `0 0 0 1px ${plan.color}, 0 8px 32px ${plan.color}33` : undefined,
                        transition: 'all 0.2s',
                      }}
                    >
                      {plan.highlight && !isSelected && <div className="plan-card__popular">Most Popular</div>}
                      {isSelected && <div className="plan-card__popular" style={{ background: plan.color }}>✓ Selected</div>}
                      <div className="plan-card__badge">{plan.badge}</div>
                      <div className="plan-card__name" style={{ color: plan.color }}>{plan.name}</div>
                      <div className="plan-card__roi" style={{ color: plan.color }}>{plan.roiPercent}%</div>
                      <div className="plan-card__roi-label">ROI in {plan.durationDays} days</div>
                      <div className="plan-card__meta">
                        <div className="plan-card__meta-item">
                          <div className="plan-card__meta-val">${plan.minDeposit.toLocaleString()}</div>
                          <div className="plan-card__meta-key">Min</div>
                        </div>
                        <div className="plan-card__meta-item">
                          <div className="plan-card__meta-val">{plan.durationDays}d</div>
                          <div className="plan-card__meta-key">Duration</div>
                        </div>
                      </div>
                      {!canAfford && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--danger)', textAlign: 'center', marginTop: 4 }}>
                          Need ${plan.minDeposit.toLocaleString()} min.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Investment form */}
              {selected && (
                <div className="card" style={{ maxWidth: 520 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 4, fontSize: '1.1rem' }}>
                    2. Enter Investment Amount
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                    {selected.badge} <strong>{selected.name} Plan</strong> · {selected.roiPercent}% ROI · {selected.durationDays} days
                  </p>

                  <form onSubmit={handleInvest}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Amount (USD)</label>
                        <input
                          type="number" className="form-input"
                          placeholder={`Min $${selected.minDeposit.toLocaleString()}`}
                          value={amount} onChange={e => setAmount(e.target.value)}
                          min={selected.minDeposit}
                          max={selected.maxDeposit || undefined}
                          step="0.01" required
                        />
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          Range: ${selected.minDeposit.toLocaleString()} – {selected.maxDeposit ? '$' + selected.maxDeposit.toLocaleString() : 'no max'}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Currency</label>
                        <select className="form-select" value={crypto} onChange={e => setCrypto(e.target.value)}>
                          {['USDT','BTC','ETH','BNB'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Live projection */}
                    {projectedProfit && (
                      <div style={{ background: 'var(--success-light)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>You invest</span>
                          <span style={{ fontWeight: 700 }}>{fmt(Number(amount))}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: 6 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Projected profit</span>
                          <span style={{ fontWeight: 700, color: 'var(--success)' }}>+{fmt(projectedProfit)}</span>
                        </div>
                        <div style={{ height: 1, background: 'rgba(34,197,94,0.2)', margin: '10px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                          <span style={{ fontWeight: 700 }}>Total return in {selected.durationDays} days</span>
                          <span style={{ fontWeight: 800, color: 'var(--success)' }}>{fmt(Number(amount) + Number(projectedProfit))}</span>
                        </div>
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting}>
                      {submitting ? 'Processing...' : `🚀 Invest ${amount ? fmt(Number(amount)) : ''} in ${selected.name} Plan`}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default InvestPage;
