import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { mockApi } from '../context/AuthContext';

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calc, setCalc] = useState({ planId: '', amount: '' });
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    mockApi.getPlans().then(p => { setPlans(p); setLoading(false); });
  }, []);

  const handleCalc = (e) => {
    e.preventDefault();
    const plan = plans.find(p => p.id === calc.planId);
    if (!plan || !calc.amount) return;
    const amount = Number(calc.amount);
    const profit = (amount * plan.roiPercent) / 100;
    setCalcResult({ plan, amount, profit, total: amount + profit, daily: (profit / plan.durationDays).toFixed(2) });
  };

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="pub-page">
      <Navbar />

      <div className="pub-hero">
        <div className="pub-hero__glow" />
        <div className="pub-hero__badge">💼 Investment Plans</div>
        <h1 className="pub-hero__title">Find the Plan That <span>Matches Your Goals</span></h1>
        <p className="pub-hero__subtitle">
          Four professionally designed investment tiers with transparent returns, clear durations, and zero hidden fees.
        </p>
      </div>

      {/* Plans grid */}
      <section className="pub-section">
        <div className="pub-container">
          {loading ? (
            <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>
          ) : (
            <div className="plans-grid">
              {plans.map(plan => (
                <div key={plan.id} className={`plan-card ${plan.highlight ? 'plan-card--highlight' : ''}`}>
                  {plan.highlight && <div className="plan-card__popular">Most Popular</div>}
                  <div className="plan-card__badge">{plan.badge}</div>
                  <div className="plan-card__name" style={{ color: plan.color }}>{plan.name}</div>
                  <div className="plan-card__desc">{plan.description}</div>
                  <div className="plan-card__roi" style={{ color: plan.color }}>{plan.roiPercent}%</div>
                  <div className="plan-card__roi-label">ROI after {plan.durationDays} days</div>

                  <div className="plan-card__meta">
                    <div className="plan-card__meta-item">
                      <div className="plan-card__meta-val">{plan.durationDays}d</div>
                      <div className="plan-card__meta-key">Duration</div>
                    </div>
                    <div className="plan-card__meta-item">
                      <div className="plan-card__meta-val">{plan.dailyReturn}%</div>
                      <div className="plan-card__meta-key">Daily Return</div>
                    </div>
                    <div className="plan-card__meta-item">
                      <div className="plan-card__meta-val">${plan.minDeposit.toLocaleString()}</div>
                      <div className="plan-card__meta-key">Min. Deposit</div>
                    </div>
                    <div className="plan-card__meta-item">
                      <div className="plan-card__meta-val">{plan.maxDeposit ? '$' + plan.maxDeposit.toLocaleString() : 'No max'}</div>
                      <div className="plan-card__meta-key">Max. Deposit</div>
                    </div>
                  </div>

                  <ul className="plan-card__features">
                    {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>

                  <Link
                    to="/register"
                    className={`btn btn-full ${plan.highlight ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderColor: plan.highlight ? undefined : plan.color, color: plan.highlight ? undefined : plan.color }}
                  >
                    Start with {plan.name}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="pub-section pub-section--alt">
        <div className="pub-container" style={{ maxWidth: 640 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>ROI Calculator</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2rem)' }}>Calculate Your Returns</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>See exactly how much you'll earn before you invest.</p>
          </div>

          <div className="card">
            <form onSubmit={handleCalc}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Select Plan</label>
                  <select className="form-select" value={calc.planId} onChange={e => { setCalc({ ...calc, planId: e.target.value }); setCalcResult(null); }} required>
                    <option value="">Choose a plan...</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.badge} {p.name} — {p.roiPercent}% in {p.durationDays}d</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Investment Amount (USD)</label>
                  <input type="number" className="form-input" placeholder="e.g. 5000" value={calc.amount} onChange={e => { setCalc({ ...calc, amount: e.target.value }); setCalcResult(null); }} min="1" required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Calculate Returns →</button>
            </form>

            {calcResult && (
              <div style={{ marginTop: 24, padding: 20, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>You Invest</div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.1rem' }}>{fmt(calcResult.amount)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Profit Earned</div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--success)' }}>+{fmt(calcResult.profit)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Return</div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>{fmt(calcResult.total)}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  ≈ ${calcResult.daily}/day over {calcResult.plan.durationDays} days · {calcResult.plan.name} Plan
                </div>
                <Link to="/register" className="btn btn-primary btn-full" style={{ marginTop: 16 }}>
                  Start This Investment →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="pub-section">
        <div className="pub-container">
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2rem)', marginBottom: 32, textAlign: 'center' }}>Plan Comparison</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    {plans.map(p => <th key={p.id} style={{ color: p.color }}>{p.badge} {p.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['ROI',          p => `${p.roiPercent}%`],
                    ['Duration',     p => `${p.durationDays} days`],
                    ['Min. Deposit', p => `$${p.minDeposit.toLocaleString()}`],
                    ['Max. Deposit', p => p.maxDeposit ? `$${p.maxDeposit.toLocaleString()}` : 'Unlimited'],
                    ['Daily Return', p => `${p.dailyReturn}%`],
                    ['Priority Support', p => p.id !== 'plan_01' ? '✓' : '—'],
                    ['VIP Manager',  p => ['plan_03','plan_04'].includes(p.id) ? '✓' : '—'],
                    ['Compounding',  p => ['plan_03','plan_04'].includes(p.id) ? '✓' : '—'],
                  ].map(([label, fn], ri) => (
                    <tr key={ri}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</td>
                      {plans.map(p => <td key={p.id}>{fn(p)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PlansPage;
