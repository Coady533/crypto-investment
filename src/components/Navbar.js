import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <nav className={`pub-nav ${scrolled ? 'pub-nav--scrolled' : ''}`}>
      <div className="pub-nav__inner">
        <Link to="/" className="pub-nav__logo">
          <span className="pub-nav__logo-icon">◈</span>
          CryptoVault
        </Link>

        {/* Desktop links */}
        <div className="pub-nav__links">
          {[['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/plans', 'Plans'], ['/faq', 'FAQ'], ['/contact', 'Contact']].map(([path, label]) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `pub-nav__link ${isActive ? 'pub-nav__link--active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="pub-nav__actions">
          <Link to="/login"    className="btn btn-secondary btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary  btn-sm">Get Started</Link>
        </div>

        {/* Mobile burger */}
        <button className="pub-nav__burger" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="pub-nav__mobile">
          {[['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/plans', 'Plans'], ['/faq', 'FAQ'], ['/contact', 'Contact']].map(([path, label]) => (
            <Link key={path} to={path} className="pub-nav__mobile-link">{label}</Link>
          ))}
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <Link to="/login"    className="btn btn-secondary btn-sm" style={{ flex:1, justifyContent:'center' }}>Sign In</Link>
            <Link to="/register" className="btn btn-primary  btn-sm" style={{ flex:1, justifyContent:'center' }}>Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
