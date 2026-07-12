import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/auth.css';

const COUNTRIES = [
  'Nigeria','United States','United Kingdom','Canada','Australia','Germany','France',
  'South Africa','Ghana','Kenya','India','Singapore','UAE','Brazil','Romania','Italy',
  'Japan','South Korea','Mexico','Senegal','Ireland','Other'
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]         = useState({ firstName:'', lastName:'', email:'', password:'', confirmPassword:'', phone:'', country:'' });
  const [error,   setError]     = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSuccess('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, phone: form.phone, country: form.country });
      setSuccess('Account created! Your account is pending admin approval. Redirecting to login…');
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) { setError(err.response?.data?.message || 'Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="pub-page" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="auth-page" style={{ paddingTop: 68 }}>
        <div className="auth-bg-glow" />
        <div className="auth-container" style={{ maxWidth: 520 }}>
          <div className="auth-card">
            <div className="auth-header">
              <h1 className="auth-title">Create account</h1>
              <p className="auth-subtitle">Join thousands of investors on CryptoVault</p>
            </div>

            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {!success && (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" name="firstName" className="form-input" placeholder="John" value={form.firstName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" name="lastName"  className="form-input" placeholder="Doe"  value={form.lastName}  onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" name="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="tel" name="phone" className="form-input" placeholder="+1 234 567 8900" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <select name="country" className="form-select" value={form.country} onChange={handleChange}>
                      <option value="">Select country</option>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className="form-input" placeholder="Min. 6 chars" value={form.password} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" name="confirmPassword" className="form-input" placeholder="Repeat" value={form.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>
                <div className="auth-terms">By creating an account you agree to our Terms of Service and Privacy Policy.</div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            <div className="auth-footer-text">
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </div>
          </div>
          <div className="auth-note">✅ Accounts are manually reviewed for your security</div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
