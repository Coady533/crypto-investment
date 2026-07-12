import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const TEAM = [
  { name: 'Michael Chen',   role: 'CEO & Co-Founder',        bio: '15 years in institutional finance. Former VP at Goldman Sachs Digital Assets.',   initials: 'MC' },
  { name: 'Sarah Williams', role: 'CTO',                     bio: 'Ex-Google engineer. Built blockchain infrastructure handling $1B+ daily volume.',  initials: 'SW' },
  { name: 'Daniel Okafor',  role: 'Head of Compliance',      bio: 'Certified AML specialist with experience across 3 regulatory jurisdictions.',      initials: 'DO' },
  { name: 'Yuki Tanaka',    role: 'Head of Investor Relations', bio: 'Managed portfolios for HNWI clients totaling over $500M in crypto assets.',   initials: 'YT' },
];

const MILESTONES = [
  { year: '2019', event: 'CryptoVault founded in London with seed funding of $2M.' },
  { year: '2020', event: 'Launched first investment plans. Reached 5,000 active users.' },
  { year: '2021', event: 'Series A funding of $18M. Expanded to 40 countries.' },
  { year: '2022', event: '$500M assets under management. ISO 27001 security certified.' },
  { year: '2023', event: 'Launched Elite plan. 30,000 active investors on platform.' },
  { year: '2024', event: '$2.4B AUM milestone. 50,000+ investors across 80+ countries.' },
];

const AboutPage = () => (
  <div className="pub-page">
    <Navbar />

    {/* Hero */}
    <div className="pub-hero">
      <div className="pub-hero__glow" />
      <div className="pub-hero__badge">🏢 About CryptoVault</div>
      <h1 className="pub-hero__title">We're Building the Future of <span>Crypto Investment</span></h1>
      <p className="pub-hero__subtitle">
        Founded in 2019, CryptoVault is a regulated investment platform combining institutional-grade tools with a seamless experience for every investor.
      </p>
    </div>

    {/* Mission */}
    <section className="pub-section pub-section--alt">
      <div className="pub-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Our Mission</div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginBottom: 16, lineHeight: 1.2 }}>
            Democratising Access to Professional Crypto Investment
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
            We believe everyone deserves access to sophisticated investment tools — not just hedge funds and institutions. CryptoVault was built to bridge that gap, offering structured investment plans with transparent returns and uncompromising security.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Every plan we offer has been rigorously stress-tested. Our dual-code withdrawal security and human approval process means your money is protected at every step.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { icon: '🌍', val: '80+',  label: 'Countries' },
            { icon: '👥', val: '50K+', label: 'Investors' },
            { icon: '💰', val: '$2.4B', label: 'AUM' },
            { icon: '🏆', val: '5★',   label: 'Rated' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{s.val}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Timeline */}
    <section className="pub-section">
      <div className="pub-container">
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Our Journey</div>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginBottom: 48 }}>Milestones That Define Us</h2>
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
          {MILESTONES.map((m, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: 28, paddingLeft: 28 }}>
              <div style={{ position: 'absolute', left: -22, top: 4, width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg-primary)' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>{m.year}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{m.event}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="pub-section pub-section--alt">
      <div className="pub-container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Leadership</div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>Meet the Team</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {TEAM.map((member, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.2rem', margin: '0 auto 14px', background: 'var(--accent-light)', color: 'var(--accent)', border: '2px solid var(--accent)' }}>
                {member.initials}
              </div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 4 }}>{member.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent)', marginBottom: 10 }}>{member.role}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="pub-section" style={{ textAlign: 'center' }}>
      <div className="pub-container">
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginBottom: 12 }}>Ready to Join Us?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Start investing with one of our trusted plans today.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Open Your Account →</Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default AboutPage;
