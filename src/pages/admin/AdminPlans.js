import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { mockApi } from '../../context/AuthContext';

const EMPTY_PLAN = {
  name: '', badge: '⭐', description: '', minDeposit: '', maxDeposit: '',
  roiPercent: '', durationDays: '', dailyReturn: '', color: '#6c63ff',
  highlight: false, features: ['']
};

const AdminPlans = () => {
  const [plans, setPlans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // 'edit' | 'create' | 'delete'
  const [editPlan, setEditPlan]   = useState(null);
  const [form, setForm]           = useState(EMPTY_PLAN);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchPlans = async () => {
    setLoading(true);
    const data = await mockApi.getAdminPlans();
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({ ...plan, features: [...plan.features], maxDeposit: plan.maxDeposit || '' });
    setModal('edit');
  };

  const openCreate = () => {
    setEditPlan(null);
    setForm(EMPTY_PLAN);
    setModal('create');
  };

  const handleFeatureChange = (i, val) => {
    const f = [...form.features];
    f[i] = val;
    setForm({ ...form, features: f });
  };
  const addFeature    = () => setForm({ ...form, features: [...form.features, ''] });
  const removeFeature = (i) => setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        minDeposit:  Number(form.minDeposit),
        maxDeposit:  form.maxDeposit ? Number(form.maxDeposit) : null,
        roiPercent:  Number(form.roiPercent),
        durationDays: Number(form.durationDays),
        dailyReturn: Number(form.dailyReturn),
        features: form.features.filter(f => f.trim()),
      };
      if (modal === 'edit') {
        await mockApi.updatePlan(editPlan.id, payload);
        showToast('Plan updated successfully');
      } else {
        await mockApi.createPlan(payload);
        showToast('Plan created successfully');
      }
      await fetchPlans();
      setModal(null);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await mockApi.deletePlan(editPlan.id);
      showToast('Plan deleted');
      await fetchPlans();
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="page-title">Investment Plans</h1>
              <p className="page-subtitle">Create, edit, and manage all investment plan tiers.</p>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>+ Create New Plan</button>
          </div>
        </div>

        <div className="page-content">
          {loading ? (
            <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {plans.map(plan => (
                <div key={plan.id} className="card" style={{ borderLeft: `4px solid ${plan.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    {/* Left: plan info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                      <div style={{ fontSize: '2.2rem' }}>{plan.badge}</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: plan.color }}>{plan.name}</span>
                          {plan.highlight && <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>Popular</span>}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 400 }}>{plan.description}</p>
                      </div>
                    </div>

                    {/* Middle: key metrics */}
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                      {[
                        ['ROI',          `${plan.roiPercent}%`,              plan.color],
                        ['Duration',     `${plan.durationDays} days`,         'var(--text-primary)'],
                        ['Min Deposit',  fmt(plan.minDeposit),                'var(--text-primary)'],
                        ['Max Deposit',  plan.maxDeposit ? fmt(plan.maxDeposit) : 'Unlimited', 'var(--text-primary)'],
                        ['Daily Return', `${plan.dailyReturn}%`,              'var(--success)'],
                      ].map(([k, v, c]) => (
                        <div key={k} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
                          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: c }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(plan)}>✎ Edit</button>
                      <button className="btn btn-danger btn-sm"    onClick={() => { setEditPlan(plan); setModal('delete'); }}>🗑</button>
                    </div>
                  </div>

                  {/* Features */}
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {plan.features.map((f, i) => (
                      <span key={i} className="badge badge-muted" style={{ fontSize: '0.75rem' }}>✓ {f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Create / Edit Modal ── */}
      {(modal === 'edit' || modal === 'create') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'edit' ? '✎ Edit Plan' : '+ Create Plan'}</h2>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Plan Name *</label>
                  <input type="text" className="form-input" placeholder="e.g. Standard" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Badge Emoji *</label>
                  <input type="text" className="form-input" placeholder="e.g. ⭐" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <input type="text" className="form-input" placeholder="Short description of the plan" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">ROI % *</label>
                  <input type="number" className="form-input" placeholder="e.g. 15" value={form.roiPercent} onChange={e => setForm({ ...form, roiPercent: e.target.value })} min="0" step="0.1" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Days) *</label>
                  <input type="number" className="form-input" placeholder="e.g. 30" value={form.durationDays} onChange={e => setForm({ ...form, durationDays: e.target.value })} min="1" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Min Deposit ($) *</label>
                  <input type="number" className="form-input" placeholder="e.g. 1000" value={form.minDeposit} onChange={e => setForm({ ...form, minDeposit: e.target.value })} min="0" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Deposit ($)</label>
                  <input type="number" className="form-input" placeholder="Leave blank for no max" value={form.maxDeposit} onChange={e => setForm({ ...form, maxDeposit: e.target.value })} min="0" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Daily Return % *</label>
                  <input type="number" className="form-input" placeholder="e.g. 0.5" value={form.dailyReturn} onChange={e => setForm({ ...form, dailyReturn: e.target.value })} min="0" step="0.01" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Accent Color</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: 44, height: 44, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                    <input type="text" className="form-input" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="#6c63ff" style={{ fontFamily: 'monospace' }} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.highlight} onChange={e => setForm({ ...form, highlight: e.target.checked })} style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} />
                  <span className="form-label" style={{ margin: 0 }}>Mark as "Most Popular" (highlighted card)</span>
                </label>
              </div>

              {/* Features */}
              <div className="form-group">
                <label className="form-label">Features / Benefits</label>
                {form.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="text" className="form-input"
                      placeholder={`Feature ${i + 1}, e.g. 24/7 support`}
                      value={f} onChange={e => handleFeatureChange(i, e.target.value)}
                    />
                    {form.features.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFeature(i)} style={{ flexShrink: 0 }}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={addFeature}>+ Add Feature</button>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : modal === 'edit' ? 'Save Changes' : 'Create Plan'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {modal === 'delete' && editPlan && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <div className="modal-header">
              <h2 className="modal-title">🗑 Delete Plan</h2>
            </div>
            <div className="alert alert-error">
              Are you sure you want to delete the <strong>{editPlan.name}</strong> plan? This cannot be undone. Users with active investments in this plan will not be affected.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting...' : 'Yes, Delete Plan'}</button>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--success)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.88rem', zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', animation: 'fadeUp 0.3s ease' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
