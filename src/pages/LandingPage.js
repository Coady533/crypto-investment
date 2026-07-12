import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LiveActivityTicker from "../components/LiveActivityTicker";
import { INITIAL_PLANS } from "../context/AuthContext";
import "../styles/landing.css";
import { formatUsdPrice, useCryptoMarket } from "../utils/cryptoMarket";
import heroTradingImage from "../images/hero-trading.jpg";
import cryptoCoinsImage from "../images/crypto-coins.jpg";
import bitcoinGoldImage from "../images/bitcoin-gold.jpg";
import bitcoinKeyboardImage from "../images/bitcoin-keyboard.jpg";
import bitcoinChipImage from "../images/bitcoin-chip.jpg";
import bitcoinCrystalsImage from "../images/bitcoin-crystals.jpg";

const CRYPTO_TICKERS = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    fallbackPrice: 67420,
    fallbackChange: 4.2,
    icon: "₿",
    color: "#f7931a",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    fallbackPrice: 3812,
    fallbackChange: 2.8,
    icon: "Ξ",
    color: "#627eea",
  },
  {
    symbol: "BNB",
    name: "BNB",
    fallbackPrice: 542,
    fallbackChange: -0.6,
    icon: "◈",
    color: "#f3ba2f",
  },
  {
    symbol: "USDT",
    name: "Tether",
    fallbackPrice: 1,
    fallbackChange: 0,
    icon: "₮",
    color: "#22c55e",
  },
];

const TRUST_STATS = [
  { value: "$2.4B+", label: "Assets Under Management" },
  { value: "50K+", label: "Active Investors" },
  { value: "98.7%", label: "On-time Payouts" },
  { value: "4.9★", label: "Trustpilot Rating" },
];

const TESTIMONIALS = [
  {
    name: "David O.",
    country: "🇳🇬 Nigeria",
    plan: "Premium",
    text: "I started with the Standard plan and doubled my portfolio within two months. The withdrawal process is smooth and the support team is always responsive.",
    amount: "$12,400",
  },
  {
    name: "Rachel T.",
    country: "🇬🇧 UK",
    plan: "Elite",
    text: "CryptoVault is the most transparent investment platform I have used. My Elite plan returned 50% in 90 days exactly as advertised.",
    amount: "$87,000",
  },
  {
    name: "Kenji M.",
    country: "🇯🇵 Japan",
    plan: "Standard",
    text: "The security codes feature gave me full peace of mind. No withdrawal goes through without my explicit approval. Brilliant system.",
    amount: "$9,200",
  },
];

const LandingPage = () => {
  const { market, fallbackPrices } = useCryptoMarket();

  const tickerCards = CRYPTO_TICKERS.map((ticker) => {
    const live = market[ticker.symbol];
    const price =
      live?.price ?? fallbackPrices[ticker.symbol] ?? ticker.fallbackPrice;
    const change = live?.change ?? ticker.fallbackChange;

    return {
      ...ticker,
      price: formatUsdPrice(price),
      change: `${change >= 0 ? "+" : ""}${Number(change || 0).toFixed(1)}%`,
      up: change >= 0,
    };
  });

  return (
    <div className="landing">
      <Navbar />
      <LiveActivityTicker />

      {/* ── Hero ── */}
      <section className="hero">
        {/* Hero background image */}
        <div className="hero-bg">
          <img src={heroTradingImage} alt="crypto trading" />
          <div className="hero-bg-overlay" />
        </div>

        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Trusted by 50,000+ investors in 80+ countries
          </div>
          <h1 className="hero-title">
            Grow Your Wealth
            <br />
            <span className="hero-title-accent">With Crypto Intelligence</span>
          </h1>
          <p className="hero-subtitle">
            Choose from four expertly designed investment plans — Basic,
            Standard, Premium, and Elite. Deposit, invest, and watch guaranteed
            returns land in your account on schedule.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Open Free Account →
            </Link>
            <Link to="/plans" className="btn btn-outline  btn-lg">
              View Investment Plans
            </Link>
          </div>
          <div className="hero-stats">
            {TRUST_STATS.map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="hero-stat-divider" />}
                <div className="hero-stat">
                  <span className="hero-stat-value">{s.value}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Floating crypto ticker cards */}
        <div className="hero-cards">
          {tickerCards.map((c, i) => (
            <div
              className="crypto-card"
              key={i}
              style={{ animationDelay: `${i * 1.2}s` }}
            >
              <div className="crypto-card-icon" style={{ color: c.color }}>
                {c.icon}
              </div>
              <div>
                <div className="crypto-card-name">{c.name}</div>
                <div className="crypto-card-price">{c.price}</div>
              </div>
              <div
                className={`crypto-card-change ${c.up ? "positive" : "negative"}`}
              >
                {c.change}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Image Gallery Strip ── */}
      <section className="img-strip">
        <div className="img-strip__track">
          {[
            { src: bitcoinChipImage, alt: "Bitcoin on microchip" },
            { src: bitcoinCrystalsImage, alt: "Bitcoin in crystals" },
            { src: cryptoCoinsImage, alt: "Multiple crypto coins" },
            { src: bitcoinKeyboardImage, alt: "Bitcoin on keyboard" },
            { src: bitcoinGoldImage, alt: "Gold Bitcoin coin" },
          ].map((img, i) => (
            <div key={i} className="img-strip__item">
              <img src={img.src} alt={img.alt} />
              <div className="img-strip__overlay" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Investment Plans Preview ── */}
      <section className="features" style={{ paddingTop: 80 }}>
        <div className="features-inner">
          <div className="section-label">Investment Plans</div>
          <h2 className="section-title">
            Choose the Plan That Fits Your Goals
          </h2>
          <div className="plans-grid">
            {INITIAL_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card ${plan.highlight ? "plan-card--highlight" : ""}`}
              >
                {plan.highlight && (
                  <div className="plan-card__popular">Most Popular</div>
                )}
                <div className="plan-card__badge">{plan.badge}</div>
                <div className="plan-card__name" style={{ color: plan.color }}>
                  {plan.name}
                </div>
                <div className="plan-card__desc">{plan.description}</div>
                <div className="plan-card__roi" style={{ color: plan.color }}>
                  {plan.roiPercent}%
                </div>
                <div className="plan-card__roi-label">
                  ROI after {plan.durationDays} days
                </div>
                <div className="plan-card__meta">
                  <div className="plan-card__meta-item">
                    <div className="plan-card__meta-val">
                      {plan.durationDays}d
                    </div>
                    <div className="plan-card__meta-key">Duration</div>
                  </div>
                  <div className="plan-card__meta-item">
                    <div className="plan-card__meta-val">
                      ${plan.minDeposit.toLocaleString()}
                    </div>
                    <div className="plan-card__meta-key">Min. Deposit</div>
                  </div>
                </div>
                <ul className="plan-card__features">
                  {plan.features.slice(0, 3).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`btn btn-full ${plan.highlight ? "btn-primary" : "btn-outline"}`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link to="/plans" className="btn btn-secondary">
              View Full Plan Details →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why CryptoVault — with image ── */}
      <section
        className="features"
        style={{ background: "var(--bg-secondary)" }}
      >
        <div className="features-inner">
          <div className="section-label">Why Us</div>
          <h2 className="section-title">
            Everything You Need to Invest Confidently
          </h2>

          {/* Image + features side by side */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 40,
              alignItems: "center",
              marginBottom: 40,
            }}
          >
            <div className="why-image-wrap">
              <img
                src={cryptoCoinsImage}
                alt="crypto coins"
                className="why-image"
              />
              <div className="why-image-badge">
                <span style={{ fontSize: "1.4rem" }}>🔐</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>
                    256-bit Security
                  </div>
                  <div
                    style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}
                  >
                    Bank-grade encryption
                  </div>
                </div>
              </div>
            </div>
            <div>
              {[
                {
                  icon: "🔐",
                  title: "Bank-Grade Security",
                  desc: "Multi-layer authentication, cold storage, and 256-bit SSL protect every transaction.",
                },
                {
                  icon: "⚡",
                  title: "Instant Activation",
                  desc: "Plans activate immediately after your deposit is confirmed by our admin team.",
                },
                {
                  icon: "📊",
                  title: "Real-Time Dashboard",
                  desc: "Track holdings, earnings, and performance with live data updated every second.",
                },
                {
                  icon: "🛡️",
                  title: "Withdrawal Protection",
                  desc: "Withdrawals require admin-issued auth codes and policy codes for maximum security.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 14, marginBottom: 20 }}
                >
                  <div style={{ fontSize: "1.6rem", flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      {f.title}
                    </div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                      }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="features-grid">
            {[
              {
                icon: "🤝",
                title: "Dedicated Support",
                desc: "Human-reviewed account approvals and a support team available around the clock.",
              },
              {
                icon: "💹",
                title: "Compounding Returns",
                desc: "Premium and Elite plans support automatic reinvestment for exponential growth.",
              },
            ].map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bitcoin Showcase Banner ── */}
      <section className="btc-banner">
        <img src={bitcoinGoldImage} alt="Bitcoin" className="btc-banner__img" />
        <div className="btc-banner__overlay" />
        <div className="btc-banner__content">
          <div className="section-label" style={{ color: "#f7931a" }}>
            Bitcoin & More
          </div>
          <h2
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.6rem,4vw,2.4rem)",
              marginBottom: 12,
              color: "#fff",
            }}
          >
            Invest in the World's
            <br />
            Leading Cryptocurrencies
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              maxWidth: 480,
              lineHeight: 1.7,
              marginBottom: 28,
            }}
          >
            BTC, ETH, USDT, and BNB — all supported on CryptoVault. Diversify
            across multiple assets with a single account.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Investing →
          </Link>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works">
        <div className="features-inner">
          <div className="section-label">Get Started</div>
          <h2 className="section-title">Up and Running in Four Simple Steps</h2>
          <div className="steps">
            {[
              [
                "1",
                "Create Account",
                "Register and wait for admin approval — usually within a few hours.",
              ],
              [
                "2",
                "Deposit Funds",
                "Fund your wallet via BTC, ETH, USDT, BNB, or bank transfer.",
              ],
              [
                "3",
                "Choose a Plan",
                "Select Basic, Standard, Premium, or Elite based on your goals.",
              ],
              [
                "4",
                "Earn Returns",
                "Sit back as your plan runs its course and profits credit to your account.",
              ],
            ].map(([num, title, desc], i, arr) => (
              <React.Fragment key={i}>
                <div className="step">
                  <div className="step-num">{num}</div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                {i < arr.length - 1 && <div className="step-arrow">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        className="features"
        style={{ background: "var(--bg-secondary)" }}
      >
        <div className="features-inner">
          <div className="section-label">Testimonials</div>
          <h2 className="section-title">What Our Investors Say</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="card"
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div
                  style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                >
                  <div className="avatar" style={{ flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {t.country}
                    </div>
                    <span
                      className="badge badge-accent"
                      style={{ marginTop: 4, fontSize: "0.7rem" }}
                    >
                      {t.plan} Plan
                    </span>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div
                      style={{
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontWeight: 800,
                        color: "var(--success)",
                        fontSize: "1rem",
                      }}
                    >
                      {t.amount}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      earned
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.65,
                    fontStyle: "italic",
                  }}
                >
                  "{t.text}"
                </p>
                <div style={{ display: "flex", gap: 2 }}>
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i} style={{ color: "var(--gold)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Second Image Banner (bitcoin keyboard) ── */}
      <section className="btc-banner" style={{ minHeight: 300 }}>
        <img
          src={bitcoinKeyboardImage}
          alt="Bitcoin on keyboard"
          className="btc-banner__img"
        />
        <div
          className="btc-banner__overlay"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,11,15,0.85) 0%, rgba(108,99,255,0.4) 100%)",
          }}
        />
        <div
          className="btc-banner__content"
          style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.6rem,4vw,2.4rem)",
              marginBottom: 12,
              color: "#fff",
            }}
          >
            Your Investment Journey Starts Here
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              marginBottom: 28,
            }}
          >
            Join 50,000+ investors who trust CryptoVault to grow their wealth.
            Secure, transparent, and built for results.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Free Account →
            </Link>
            <Link to="/plans" className="btn btn-outline  btn-lg">
              Explore Plans
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
