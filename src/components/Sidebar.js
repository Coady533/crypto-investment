import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserSidebarLinks = () => (
  <>
    <div className="nav-section-label">Main</div>
    <NavLink to="/dashboard"      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">⬡</span> Dashboard</NavLink>
    <NavLink to="/invest"         className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">📈</span> Invest</NavLink>
    <NavLink to="/my-investments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">💼</span> My Investments</NavLink>
    <NavLink to="/copy-trading"   className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">📊</span> Copy Trading</NavLink>
    <NavLink to="/deposit"        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">↓</span> Deposit</NavLink>
    <NavLink to="/withdraw"       className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">↑</span> Withdraw</NavLink>
    <NavLink to="/transactions"   className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">≡</span> Transactions</NavLink>
    <div className="nav-section-label">Account</div>
    <NavLink to="/profile"        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">◎</span> Profile</NavLink>
  </>
);

const AdminSidebarLinks = () => (
  <>
    <div className="nav-section-label">Admin</div>
    <NavLink to="/admin"               end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">⬡</span> Overview</NavLink>
    <NavLink to="/admin/users"             className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">◎</span> Users</NavLink>
    <NavLink to="/admin/transactions"      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">≡</span> Transactions</NavLink>
    <NavLink to="/admin/plans"             className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">📋</span> Investment Plans</NavLink>
    <NavLink to="/admin/copy-trading"      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">📊</span> Copy Trading</NavLink>
  </>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '?';

  return (
    <>
      <button className="menu-toggle" onClick={() => setOpen(true)}>☰</button>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-text">CryptoVault</div>
          <div className="logo-sub">Investment Platform</div>
        </div>
        <nav className="sidebar-nav" onClick={() => setOpen(false)}>
          {user?.role === 'admin' ? <AdminSidebarLinks /> : <UserSidebarLinks />}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="avatar">{initials}</div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role === 'admin' ? '🛡 Admin' : '👤 User'}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-full btn-sm" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
