import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const SERVICES = [
  { icon: '📈', title: 'Fixed-Term Investment Plans', desc: 'Four tiered plans — Basic, Standard, Premium, and Elite — with guaranteed ROI over defined durations from 14 to 90 days. All returns are credited directly to your dashboard balance.' },
  { icon: '🔄', title: 'Crypto Deposits & Withdrawals', desc: 'Fund your account with BTC, ETH, USDT, BNB, or USD bank transfer. Withdrawals are processed securely using our dual-code authentication system.' },
  { icon: '📊', title: 'Portfolio Management', desc: 'Real-time tracking of your BTC, ETH, USDT, and BNB holdings. Visual breakdown of invested capital, active plans, and cumulative earnings.' },
  { icon: '🛡️', title: 'Dual-Code Withdrawal Security', desc: 'Every withdrawal requires an admin-issued Authentication Code and Policy Code before funds are released. This eliminates unauthorized withdrawals entirely.' },
  { icon: '👤', title: 'Dedicated Account Management', desc: 'Premium and Elite plan holders receive a dedicated account manager for personalized investment guidance and priority processing.' },
  { icon: '🔁', title: 'Compounding & Reinvestment', desc: 'Opt to automatically reinvest your returns into a new plan cycle. Compound your way to exponential growth with no manual intervention required.' },
  { icon: '📋', title: 'Transparent Reporting', desc: 'Full transaction history, plan performance reports, and earnings statements available at any time from your dashboard.' },
  { icon: '🌐', title: 'Multi-Currency Support', desc: 'Invest and withdraw across five major currencies. Automatic conversion rates are applied at the time of transaction.' },
];

const ServicesPage = () => (
  <div className="pub-page">
    <Navbar />

    <div className="pub-hero">
      <div className="pub-hero__glow" />
      <div className="pub-hero__badge">⚙️ Our Services</div>
      <h1 className="pub-hero__title">Everything You Need to <span>Grow Your Money</span></h1>
      <p className="pub-hero__subtitle">
        From fixed-term investment plans to secure withdrawals — CryptoVault gives you a complete investment ecosystem in one platform.
      </p>
    </div>

    <section className="pub-section pub-section--alt">
      <div className="pub-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {SERVICES.map((s, i) => (
            <div key={i} className="card card-hover" style={{ display: 'flex', gap: 16 }}>
              <div style={{ fontSize: '2rem', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Security spotlight */}
    <section className="pub-section">
      <div className="pub-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Security First</div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: 16 }}>
            How Our Dual-Code Withdrawal System Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
            No withdrawal is processed without two unique codes issued exclusively by our admin team. This prevents any unauthorized access to your funds — even if your account credentials were compromised.
          </p>
          {['You submit a withdrawal request', 'Admin issues your Authentication Code', 'Admin issues your Policy Code', 'You enter both codes to confirm', 'Admin completes final approval'].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-light)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{i+1}</div>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{step}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['256-bit SSL', 'All data encrypted in transit and at rest'],
            ['Cold Storage', '95% of assets held offline in cold wallets'],
            ['2FA Ready', 'Optional two-factor authentication for all accounts'],
            ['Human Review', 'Every account and transaction reviewed by staff'],
          ].map(([title, desc], i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: '1.4rem' }}>🔒</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="pub-section pub-section--alt" style={{ textAlign: 'center' }}>
      <div className="pub-container">
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.6rem,3vw,2.2rem)', marginBottom: 12 }}>Start Using Our Services Today</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Create a free account in minutes. No minimum balance required to register.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg">Create Account →</Link>
          <Link to="/plans"    className="btn btn-outline  btn-lg">See Plans</Link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default ServicesPage;
