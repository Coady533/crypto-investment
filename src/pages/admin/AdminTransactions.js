import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { mockApi } from '../../context/AuthContext';

const STATUS_INFO = {
  pending:         { label: 'Pending',           cls: 'badge-warning' },
  code_required:   { label: 'Code Required',     cls: 'badge-accent'  },
  codes_submitted: { label: 'Codes Submitted ✓', cls: 'badge-accent'  },
  approved:        { label: 'Approved',          cls: 'badge-success' },
  completed:       { label: 'Completed',         cls: 'badge-success' },
  rejected:        { label: 'Rejected',          cls: 'badge-danger'  }
};

const AdminTransactions = () => {
  const [transactions,  setTransactions]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [filter,        setFilter]        = useState('all');
  const [typeFilter,    setTypeFilter]    = useState('all');
  const [detailModal,   setDetailModal]   = useState(null);
  const [actionModal,   setActionModal]   = useState(null);
  const [adminNote,     setAdminNote]     = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast,         setToast]         = useState('');
  const [proofModal,    setProofModal]    = useState(null); // full-screen proof image

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchTransactions = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (filter     !== 'all') params.status = filter;
      if (typeFilter !== 'all') params.type   = typeFilter;
      const data = await mockApi.getAdminTransactions(params);
      setTransactions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally { setLoading(false); }
  }, [filter, typeFilter]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    try {
      if (actionModal.action === 'approve') {
        await mockApi.approveTransaction(actionModal.tx._id, { adminNote });
        showToast('✅ Transaction approved successfully');
      } else {
        await mockApi.rejectTransaction(actionModal.tx._id, { adminNote });
        showToast('❌ Transaction rejected');
      }
      setActionModal(null);
      setAdminNote('');
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally { setActionLoading(false); }
  };

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  const getDestination = tx => {
    if (tx.type !== 'withdrawal') return null;
    if (tx.walletAddress) return tx.walletAddress;
    if (tx.bankDetails?.accountNumber)
      return `${tx.bankDetails.bankName || 'Bank'} — ${tx.bankDetails.accountNumber}`;
    return null;
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="page-title">Transaction Management</h1>
              <p className="page-subtitle">Approve deposits, process withdrawals, view payment proofs.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchTransactions}>⟳ Refresh</button>
          </div>
        </div>

        <div className="page-content">
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {[['all','All Status'],['pending','Pending'],['codes_submitted','Codes Submitted'],['completed','Completed'],['rejected','Rejected']].map(([val, label]) => (
              <button key={val} className={`btn btn-sm ${filter === val ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(val)}>
                {label}
                {val === 'pending' && transactions.filter(t => t.status === 'pending').length > 0 && (
                  <span style={{ marginLeft: 6, background: 'rgba(255,255,255,0.3)', padding: '1px 6px', borderRadius: 100, fontSize: '0.7rem' }}>
                    {transactions.filter(t => t.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[['all','All Types'],['deposit','Deposits'],['withdrawal','Withdrawals']].map(([val, label]) => (
              <button key={val} className={`btn btn-sm ${typeFilter === val ? 'btn-outline' : 'btn-secondary'}`} onClick={() => setTypeFilter(val)}>{label}</button>
            ))}
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="card">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
                <div style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: '0.88rem' }}>Loading...</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">No transactions found.</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Destination / Details</th>
                      <th>Proof</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => {
                      const status     = STATUS_INFO[tx.status] || { label: tx.status, cls: 'badge-muted' };
                      const canApprove = ['pending', 'codes_submitted'].includes(tx.status);
                      const canReject  = ['pending', 'codes_submitted', 'code_required'].includes(tx.status);
                      const destination = getDestination(tx);

                      return (
                        <tr key={tx._id}>
                          {/* User */}
                          <td>
                            {tx.user ? (
                              <div className="table-user">
                                <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                  {tx.user.firstName?.[0]}{tx.user.lastName?.[0]}
                                </div>
                                <div>
                                  <div className="user-name">{tx.user.firstName} {tx.user.lastName}</div>
                                  <div className="user-email">{tx.user.email}</div>
                                </div>
                              </div>
                            ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </td>

                          {/* Type */}
                          <td>
                            <span style={{ fontWeight: 600, textTransform: 'capitalize', color: tx.type === 'deposit' ? 'var(--success)' : 'var(--danger)' }}>
                              {tx.type === 'deposit' ? '↓' : '↑'} {tx.type}
                            </span>
                          </td>

                          {/* Amount */}
                          <td>
                            <div style={{ fontWeight: 700 }}>{fmt(tx.amount)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.cryptoType}</div>
                          </td>

                          {/* Destination */}
                          <td style={{ maxWidth: 160 }}>
                            {tx.type === 'withdrawal' ? (
                              destination ? (
                                <div>
                                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }} title={destination}>
                                    {destination}
                                  </div>
                                  <button style={{ fontSize: '0.7rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }} onClick={() => setDetailModal(tx)}>
                                    Full details →
                                  </button>
                                </div>
                              ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Not provided</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{tx.description || '—'}</span>
                            )}
                          </td>

                          {/* Proof image */}
                          <td>
                            {tx.proofImage ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <img
                                  src={tx.proofImage} alt="proof"
                                  onClick={() => setProofModal(tx.proofImage)}
                                  style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)' }}
                                />
                                <button
                                  style={{ fontSize: '0.7rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                  onClick={() => setProofModal(tx.proofImage)}
                                >
                                  View
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                            )}
                          </td>

                          {/* Status */}
                          <td>
                            <span className={`badge ${status.cls}`}>{status.label}</span>
                            {tx.type === 'withdrawal' && tx.codesVerified && (
                              <div style={{ fontSize: '0.68rem', color: 'var(--success)', marginTop: 2 }}>✓ Codes verified</div>
                            )}
                          </td>

                          {/* Date */}
                          <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>

                          {/* Actions */}
                          <td>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => setDetailModal(tx)}>👁</button>
                              {canApprove && (
                                <button className="btn btn-success btn-sm" onClick={() => { setActionModal({ tx, action: 'approve' }); setAdminNote(''); }}>✓</button>
                              )}
                              {canReject && (
                                <button className="btn btn-danger btn-sm" onClick={() => { setActionModal({ tx, action: 'reject' }); setAdminNote(''); }}>✕</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Full Proof Image Modal ── */}
      {proofModal && (
        <div className="modal-overlay" onClick={() => setProofModal(null)} style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setProofModal(null)}
              style={{ position: 'absolute', top: -16, right: -16, background: 'var(--danger)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >✕</button>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 8 }}>
              Payment Proof Screenshot
            </div>
            <img
              src={proofModal} alt="Payment proof"
              style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 'var(--radius-lg)', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal" style={{ maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            <div className="modal-header">
              <h2 className="modal-title">Transaction Details</h2>
            </div>

            {/* User */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>User</div>
              <div style={{ fontWeight: 700 }}>{detailModal.user?.firstName} {detailModal.user?.lastName}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{detailModal.user?.email}</div>
            </div>

            {/* Transaction info */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Transaction</div>
              {[
                ['Type',        <span style={{ textTransform: 'capitalize', fontWeight: 700, color: detailModal.type === 'deposit' ? 'var(--success)' : 'var(--danger)' }}>{detailModal.type}</span>],
                ['Amount',      <strong>{fmt(detailModal.amount)}</strong>],
                ['Currency',    detailModal.cryptoType],
                ['Status',      <span className={`badge ${STATUS_INFO[detailModal.status]?.cls || 'badge-muted'}`}>{detailModal.status}</span>],
                ['Date',        new Date(detailModal.createdAt).toLocaleString()],
                ['Note',        detailModal.description || '—'],
                ['Admin Note',  detailModal.adminNote   || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{k}</span>
                  <span style={{ textAlign: 'right', maxWidth: '65%', wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Payment Proof */}
            {detailModal.type === 'deposit' && (
              <div style={{ background: 'var(--accent-light)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  📸 Payment Proof
                </div>
                {detailModal.proofImage ? (
                  <div>
                    <img
                      src={detailModal.proofImage}
                      alt="Payment proof"
                      onClick={() => setProofModal(detailModal.proofImage)}
                      style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
                    />
                    {detailModal.proofName && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                        File: {detailModal.proofName}
                      </div>
                    )}
                    <button
                      className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}
                      onClick={() => setProofModal(detailModal.proofImage)}
                    >
                      🔍 View Full Size
                    </button>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
                    No proof image uploaded yet
                  </div>
                )}
              </div>
            )}

            {/* Withdrawal Destination */}
            {detailModal.type === 'withdrawal' && (
              <div style={{ background: 'var(--warning-light)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  💳 Withdrawal Destination
                </div>

                {detailModal.walletAddress && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Crypto Wallet Address</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 600, wordBreak: 'break-all', flex: 1 }}>
                        {detailModal.walletAddress}
                      </span>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.8rem', flexShrink: 0 }}
                        onClick={() => { navigator.clipboard.writeText(detailModal.walletAddress); showToast('📋 Address copied!'); }}
                      >📋</button>
                    </div>
                  </div>
                )}

                {detailModal.bankDetails?.accountNumber && (
                  <div>
                    {[
                      ['Bank Name',      detailModal.bankDetails.bankName],
                      ['Account Name',   detailModal.bankDetails.accountName],
                      ['Account Number', detailModal.bankDetails.accountNumber],
                      ['Routing Number', detailModal.bankDetails.routingNumber],
                      ['SWIFT / BIC',    detailModal.bankDetails.swiftCode],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(245,158,11,0.15)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!detailModal.walletAddress && !detailModal.bankDetails?.accountNumber && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No destination details provided</div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(245,158,11,0.2)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Codes Verified</span>
                  <span style={{ fontWeight: 700, color: detailModal.codesVerified ? 'var(--success)' : 'var(--warning)' }}>
                    {detailModal.codesVerified ? '✓ Yes' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {['pending', 'codes_submitted'].includes(detailModal.status) && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={() => { setActionModal({ tx: detailModal, action: 'approve' }); setDetailModal(null); setAdminNote(''); }}>
                  ✓ Approve
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { setActionModal({ tx: detailModal, action: 'reject' }); setDetailModal(null); setAdminNote(''); }}>
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Action Confirm Modal ── */}
      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActionModal(null)}>✕</button>
            <div className="modal-header">
              <h2 className="modal-title">
                {actionModal.action === 'approve' ? '✅ Approve Transaction' : '❌ Reject Transaction'}
              </h2>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
              {[
                ['User',   `${actionModal.tx.user?.firstName} ${actionModal.tx.user?.lastName}`],
                ['Type',   actionModal.tx.type],
                ['Amount', fmt(actionModal.tx.amount)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{v}</span>
                </div>
              ))}
              {actionModal.tx.type === 'withdrawal' && getDestination(actionModal.tx) && (
                <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Send funds to:</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--warning)', wordBreak: 'break-all' }}>
                    {getDestination(actionModal.tx)}
                  </div>
                </div>
              )}
            </div>

            {actionModal.action === 'approve' && (
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                ℹ️ {actionModal.tx.type === 'deposit'
                  ? "Approving will credit the user's balance."
                  : "Approving will deduct from the user's balance and release funds to destination."}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Admin Note (optional)</label>
              <input type="text" className="form-input" placeholder="Note for the user..." value={adminNote} onChange={e => setAdminNote(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className={`btn ${actionModal.action === 'approve' ? 'btn-success' : 'btn-danger'}`} onClick={handleAction} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : actionModal.action === 'approve' ? '✅ Confirm Approval' : '❌ Confirm Rejection'}
              </button>
              <button className="btn btn-secondary" onClick={() => setActionModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: toast.startsWith('✅') ? 'var(--success)' : toast.startsWith('📋') ? 'var(--accent)' : 'var(--danger)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.88rem', zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', animation: 'fadeUp 0.3s ease' }}>
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
