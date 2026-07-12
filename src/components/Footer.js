import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="pub-footer">
    <div className="pub-footer__inner">
      <div className="pub-footer__col pub-footer__brand">
        <div className="pub-footer__logo">
          <span style={{ color:'var(--accent)' }}>◈</span> CryptoVault
        </div>
        <p className="pub-footer__tagline">
          Institutional-grade crypto investment tools for every type of investor. Grow your portfolio with confidence.
        </p>
        <div className="pub-footer__social">
          {['𝕏','in','f','t'].map((s,i) => (
            <a key={i} href="#!" className="pub-footer__social-link">{s}</a>
          ))}
        </div>
      </div>

      <div className="pub-footer__col">
        <div className="pub-footer__heading">Company</div>
        <Link to="/about"    className="pub-footer__link">About Us</Link>
        <Link to="/services" className="pub-footer__link">Services</Link>
        <Link to="/plans"    className="pub-footer__link">Investment Plans</Link>
        <Link to="/contact"  className="pub-footer__link">Contact</Link>
      </div>

      <div className="pub-footer__col">
        <div className="pub-footer__heading">Support</div>
        <Link to="/faq"      className="pub-footer__link">FAQ</Link>
        <Link to="/contact"  className="pub-footer__link">Help Center</Link>
        <a href="#!"          className="pub-footer__link">Live Chat</a>
        <a href="#!"          className="pub-footer__link">Telegram</a>
      </div>

      <div className="pub-footer__col">
        <div className="pub-footer__heading">Legal</div>
        <a href="#!" className="pub-footer__link">Privacy Policy</a>
        <a href="#!" className="pub-footer__link">Terms of Service</a>
        <a href="#!" className="pub-footer__link">AML Policy</a>
        <a href="#!" className="pub-footer__link">Risk Disclaimer</a>
      </div>
    </div>

    <div className="pub-footer__bottom">
      <span>© {new Date().getFullYear()} CryptoVault. All rights reserved.</span>
      <span>⚠ Investing involves risk. Past performance is not indicative of future results.</span>
    </div>
  </footer>
);

export default Footer;
