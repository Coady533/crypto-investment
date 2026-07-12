import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const FAQS = [
  { cat: 'Getting Started', q: 'How do I create an account?', a: 'Click "Get Started" on our homepage and fill in the registration form. Once submitted, your account goes into a pending state and our admin team will review and approve it — typically within a few hours.' },
  { cat: 'Getting Started', q: 'How long does account approval take?', a: 'Most accounts are approved within 2–12 hours during business days. You will receive an email notification once your account is activated.' },
  { cat: 'Deposits', q: 'What payment methods do you accept?', a: 'We accept Bitcoin (BTC), Ethereum (ETH), Tether (USDT), BNB, and USD bank transfers. Crypto deposits are typically credited within 24–48 hours after admin confirmation.' },
  { cat: 'Deposits', q: 'Is there a minimum deposit?', a: 'There is no minimum deposit to fund your account. However, each investment plan has its own minimum — starting at $100 for the Basic plan.' },
  { cat: 'Investment Plans', q: 'How do I choose the right plan?', a: 'It depends on your budget and investment horizon. The Basic plan is great for beginners ($100–$999), Standard for intermediate investors ($1,000–$4,999), Premium for experienced investors ($5,000–$49,999), and Elite for high-net-worth individuals ($50,000+).' },
  { cat: 'Investment Plans', q: 'Can I invest in multiple plans at once?', a: 'Yes! You can have multiple active investments across different plans simultaneously, as long as your account balance covers the investment amounts.' },
  { cat: 'Investment Plans', q: 'What happens when my plan matures?', a: 'When your plan reaches its end date, the principal plus earned profit is automatically credited back to your account balance. You can then reinvest or withdraw as you wish.' },
  { cat: 'Withdrawals', q: 'How do I withdraw my funds?', a: 'Go to the Withdraw page, enter the amount and your wallet/bank details, then submit the request. You will then receive an Authentication Code and Policy Code from our admin team which you must enter to confirm the withdrawal.' },
  { cat: 'Withdrawals', q: 'Why do I need codes to withdraw?', a: 'Our dual-code system is a security measure to prevent unauthorized withdrawals. Even if someone gains access to your account, they cannot withdraw funds without the codes — which only our admin team can issue.' },
  { cat: 'Withdrawals', q: 'How long do withdrawals take?', a: 'Once codes are verified and admin completes final approval, crypto withdrawals process within 24–48 hours. Bank transfers may take 2–5 business days.' },
  { cat: 'Security', q: 'How is my money protected?', a: 'We use 256-bit SSL encryption, cold storage for 95% of assets, dual-code withdrawal protection, and human review for all transactions. Your funds are insured against platform risk.' },
  { cat: 'Security', q: 'What if I forget my password?', a: 'Contact our support team via the Contact page or live chat. We will verify your identity and assist with account recovery.' },
];

const AccordionItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{q}</span>
        <span style={{ color: 'var(--accent)', fontSize: '1.1rem', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, paddingBottom: 16 }}>{a}</p>}
    </div>
  );
};

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(FAQS.map(f => f.cat)))];
  const filtered = activeCategory === 'All' ? FAQS : FAQS.filter(f => f.cat === activeCategory);

  return (
    <div className="pub-page">
      <Navbar />
      <div className="pub-hero">
        <div className="pub-hero__glow" />
        <div className="pub-hero__badge">❓ FAQ</div>
        <h1 className="pub-hero__title">Frequently Asked <span>Questions</span></h1>
        <p className="pub-hero__subtitle">Everything you need to know about CryptoVault. Can't find your answer? Contact our support team.</p>
      </div>

      <section className="pub-section">
        <div className="pub-container" style={{ maxWidth: 800 }}>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
            {categories.map(c => (
              <button key={c} className={`btn btn-sm ${activeCategory === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory(c)}>{c}</button>
            ))}
          </div>

          <div className="card">
            {filtered.map((faq, i) => (
              <AccordionItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-section--alt" style={{ textAlign: 'center' }}>
        <div className="pub-container">
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.8rem', marginBottom: 12 }}>Still have questions?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Our support team is available 24/7 to help you.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary">Contact Support</Link>
            <Link to="/register" className="btn btn-outline">Get Started</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;
