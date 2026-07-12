import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CONTACT_INFO = [
  { icon: '📧', label: 'Email',       value: 'support@cryptovault.io',   sub: 'We reply within 2 hours' },
  { icon: '💬', label: 'Live Chat',   value: 'Available 24/7',           sub: 'Average wait: < 5 minutes' },
  { icon: '📱', label: 'Telegram',    value: '@CryptoVaultSupport',      sub: 'For urgent matters' },
  { icon: '🏢', label: 'HQ Address',  value: '1 Canada Square, London',  sub: 'United Kingdom E14 5AB' },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => setSent(true), 600);
  };

  return (
    <div className="pub-page">
      <Navbar />
      <div className="pub-hero">
        <div className="pub-hero__glow" />
        <div className="pub-hero__badge">📬 Contact Us</div>
        <h1 className="pub-hero__title">We're Here to <span>Help You</span></h1>
        <p className="pub-hero__subtitle">Whether you have a question about plans, need help with a withdrawal, or just want to chat — our team is ready.</p>
      </div>

      <section className="pub-section">
        <div className="pub-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48 }}>
          {/* Contact info */}
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.4rem', marginBottom: 24 }}>Contact Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
              {CONTACT_INFO.map((c, i) => (
                <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16 }}>
                  <div style={{ fontSize: '1.5rem' }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.value}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)', padding: 16 }}>
              <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>⏱ Response Times</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Email: within 2 hours · Live chat: under 5 minutes · Telegram: within 30 minutes. Support is available 24 hours a day, 7 days a week.
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="card">
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.3rem', marginBottom: 20 }}>Send a Message</h2>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Thank you for reaching out. Our support team will get back to you within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-select" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required>
                    <option value="">Select a subject...</option>
                    <option>Account Approval</option>
                    <option>Deposit Issue</option>
                    <option>Withdrawal Help</option>
                    <option>Investment Plan Question</option>
                    <option>Security Codes</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input" rows={5} placeholder="Describe your issue or question in detail..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg">Send Message →</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
