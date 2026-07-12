import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
    country:   user?.country   || ''
  });
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await mockApi.updateProfile(form);
      await refreshUser();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '?';
  const statusColors = { active: 'var(--success)', pending: 'var(--warning)', suspended: 'var(--danger)' };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information.</p>
        </div>
        <div className="page-content">
          <div style={{ maxWidth: 600 }}>

            {/* Header card */}
            <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-light)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.2rem' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-accent">{user?.role}</span>
                  <span className="badge" style={{ background: `${statusColors[user?.accountStatus]}22`, color: statusColors[user?.accountStatus] }}>
                    {user?.accountStatus}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>Member since</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Edit form */}
            <div className="card">
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 20 }}>Edit Information</h2>
              {success && <div className="alert alert-success">{success}</div>}
              {error   && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" name="firstName" className="form-input" value={form.firstName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" name="lastName" className="form-input" value={form.lastName} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed. Contact support.</div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="tel" name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input type="text" name="country" className="form-input" value={form.country} onChange={handleChange} placeholder="Your country" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
