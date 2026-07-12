import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';

const INITIAL_EXPERTS = [
  { id: 'exp_01', name: 'Alex Morgan',    flag: '🇺🇸', specialty: 'BTC/ETH',    roi30d: 34.2, roi90d: 89.5, winRate: 78, followers: 1240, monthlyFee: 49,  minCopy: 500,  active: true,  badge: '🏆 Top Trader' },
  { id: 'exp_02', name: 'Yuki Tanaka',    flag: '🇯🇵', specialty: 'Altcoins',   roi30d: 28.7, roi90d: 71.3, winRate: 72, followers: 876,  monthlyFee: 35,  minCopy: 250,  active: true,  badge: '⭐ Verified'   },
  { id: 'exp_03', name: 'Sofia Reyes',    flag: '🇧🇷', specialty: 'BNB/USDT',   roi30d: 41.6, roi90d: 102.4,winRate: 81, followers: 2103, monthlyFee: 79,  minCopy: 1000, active: true,  badge: '💎 Elite'      },
  { id: 'exp_04', name: 'Ibrahim Hassan', flag: '🇦🇪', specialty: 'BTC/BNB',    roi30d: 22.1, roi90d: 58.9, winRate: 69, followers: 634,  monthlyFee: 25,  minCopy: 100,  active: true,  badge: '✅ Verified'   },
];

const EMPTY_EXPERT = {
  name: '', flag: '🌍', specialty: '', roi30d: '', roi90d: '',
  winRate: '', followers: '', monthlyFee: '', minCopy: '', active: true,
  badge: '✅ Verified', bio: '', color: '#6c63ff'
};

const AdminCopyTrading = () => {
  const [experts,  setExperts]  = useState(INITIAL_EXPERTS);
  const [modal,    setModal]    = useState(null); // 'edit' | 'create' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY_EXPERT);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openEdit = expert => {
    setSelected(expert);
    setForm({ ...expert });
    setModal('edit');
  };

  const openCreate = () => {
    setSelected(null);
    setForm(EMPTY_EXPERT);
    setModal('create');
  };

  const handleSave = async e => {
    e.preventDefault(); setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    const payload = {
      ...form,
      roi30d:     Number(form.roi30d),
      roi90d:     Number(form.roi90d),
      winRate:    Number(form.winRate),
      followers:  Number(form.followers),
      monthlyFee: Number(form.monthlyFee),
      minCopy:    Number(form.minCopy),
    };
    if (modal === 'edit') {
      setExperts(prev => prev.map(e => e.id === selected.id ? { ...e, ...payload } : e));
      showToast('Expert updated successfully');
    } else {
      setExperts(prev => [...prev, { ...payload, id: 'exp_' + Date.now() }]);
      showToast('Expert added successfully');
    }
    setSaving(false);
    setModal(null);
  };

  const handleDelete = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    setExperts(prev => prev.filter(e => e.id !== selected.id));
    showToast('Expert removed');
    setSaving(false);
    setModal(null);
  };

  const toggleActive = id => {
    setExperts(prev => prev.map(e => e.id === id ? { ...e, active: !e.active } : e));
  };

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="page-title">Copy Trading Management</h1>
              <p className="page-subtitle">Add, edit, and manage expert traders available for copying.</p>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>+ Add New Expert</button>
          </div>
        </div>

        <div className="page-content">
          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-card-label">Total Experts</div>
              <div className="stat-card-value accent">{experts.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Active Experts</div>
              <div className="stat-card-value success">{experts.filter(e => e.active).length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Total Followers</div>
              <div className="stat-card-value">{experts.reduce((s, e) => s + (e.followers || 0), 0).toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Avg. Monthly Fee</div>
              <div className="stat-card-value">{fmt(experts.reduce((s, e) => s + (e.monthlyFee || 0), 0) / (experts.length || 1))}</div>
            </div>
          </div>

          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Expert</th>
                    <th>Specialty</th>
                    <th>30d ROI</th>
                    <th>Win Rate</th>
                    <th>Monthly Fee</th>
                    <th>Min. Copy</th>
                    <th>Followers</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {experts.map(expert => (
                    <tr key={expert.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.75rem' }}>
                            {expert.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="user-name">{expert.flag} {expert.name}</div>
                            <div className="user-email">{expert.badge}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-muted">{expert.specialty}</span></td>
                      <td style={{ color: 'var(--success)', fontWeight: 700 }}>+{expert.roi30d}%</td>
                      <td style={{ fontWeight: 600 }}>{expert.winRate}%</td>
                      <td style={{ fontWeight: 700 }}>{fmt(expert.monthlyFee)}/mo</td>
                      <td>{fmt(expert.minCopy)}</td>
                      <td>{expert.followers?.toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => toggleActive(expert.id)}
                          className={`badge ${expert.active ? 'badge-success' : 'badge-danger'}`}
                          style={{ border: 'none', cursor: 'pointer', padding: '4px 12px' }}
                        >
                          {expert.active ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(expert)}>✎ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => { setSelected(expert); setModal('delete'); }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ── Edit / Create Modal ── */}
      {(modal === 'edit' || modal === 'create') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'edit' ? '✎ Edit Expert' : '+ Add Expert'}</h2>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-input" placeholder="e.g. Alex Morgan" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Country Flag Emoji</label>
                  <input type="text" className="form-input" placeholder="e.g. 🇺🇸" value={form.flag} onChange={e => setForm({ ...form, flag: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Specialty *</label>
                  <input type="text" className="form-input" placeholder="e.g. BTC/ETH" value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Badge Label</label>
                  <select className="form-select" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })}>
                    <option>✅ Verified</option>
                    <option>⭐ Verified</option>
                    <option>🏆 Top Trader</option>
                    <option>💎 Elite</option>
                    <option>🔥 Hot</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">30d ROI % *</label>
                  <input type="number" className="form-input" placeholder="e.g. 34.2" value={form.roi30d} onChange={e => setForm({ ...form, roi30d: e.target.value })} step="0.1" required />
                </div>
                <div className="form-group">
                  <label className="form-label">90d ROI % *</label>
                  <input type="number" className="form-input" placeholder="e.g. 89.5" value={form.roi90d} onChange={e => setForm({ ...form, roi90d: e.target.value })} step="0.1" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Win Rate % *</label>
                  <input type="number" className="form-input" placeholder="e.g. 78" value={form.winRate} onChange={e => setForm({ ...form, winRate: e.target.value })} min="0" max="100" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Followers</label>
                  <input type="number" className="form-input" placeholder="e.g. 1240" value={form.followers} onChange={e => setForm({ ...form, followers: e.target.value })} min="0" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Monthly Fee ($) *</label>
                  <input type="number" className="form-input" placeholder="e.g. 49" value={form.monthlyFee} onChange={e => setForm({ ...form, monthlyFee: e.target.value })} min="0" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Min. Copy Amount ($) *</label>
                  <input type="number" className="form-input" placeholder="e.g. 500" value={form.minCopy} onChange={e => setForm({ ...form, minCopy: e.target.value })} min="0" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <input type="text" className="form-input" placeholder="Short bio about the trader" value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} />
                  <span className="form-label" style={{ margin: 0 }}>Active (visible to users)</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : modal === 'edit' ? 'Save Changes' : 'Add Expert'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {modal === 'delete' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <div className="modal-header"><h2 className="modal-title">🗑 Remove Expert</h2></div>
            <div className="alert alert-error">Are you sure you want to remove <strong>{selected.name}</strong>? Users currently copying this expert will be notified.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Removing...' : 'Yes, Remove'}</button>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--success)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.88rem', zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', animation: 'fadeUp 0.3s ease' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
};

export default AdminCopyTrading;
