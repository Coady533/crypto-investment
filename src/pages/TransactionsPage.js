import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { mockApi } from '../context/AuthContext';

const STATUS_LABELS = {
  pending:         { label: 'Pending',         cls: 'badge-warning' },
  code_required:   { label: 'Code Required',   cls: 'badge-accent'  },
  codes_submitted: { label: 'Codes Submitted', cls: 'badge-accent'  },
  approved:        { label: 'Approved',        cls: 'badge-success' },
  completed:       { label: 'Completed',       cls: 'badge-success' },
  rejected:        { label: 'Rejected',        cls: 'badge-danger'  }
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [error,        setError]        = useState('');

  useEffect(() => {
    mockApi.getMyTransactions()
      .then(data => setTransactions(data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load transactions'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? transactions : transactions.filter(tx => tx.type === filter);

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Transaction History</h1>
          <p className="page-subtitle">All your deposits, withdrawals, and investments.</p>
        </div>
        <div className="page-content">
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['all', 'deposit', 'withdrawal'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
                {f === 'all' ? 'All' : f + 's'}
              </button>
            ))}
          </div>

          <div className="card">
            {error && <div className="alert alert-error">{error}</div>}

            {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading transactions...</div>}

            {!loading && filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">No transactions found.</div>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Currency</th>
                      <th>Status</th>
                      <th>Note</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(tx => {
                      const status = STATUS_LABELS[tx.status] || { label: tx.status, cls: 'badge-muted' };
                      return (
                        <tr key={tx._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: tx.type === 'deposit' ? 'var(--success-light)' : 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: tx.type === 'deposit' ? 'var(--success)' : 'var(--danger)' }}>
                                {tx.type === 'deposit' ? '↓' : '↑'}
                              </div>
                              <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--text-primary)' }}>{tx.type}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: tx.type === 'deposit' ? 'var(--success)' : 'var(--danger)' }}>
                            {tx.type === 'deposit' ? '+' : '-'}{fmt(tx.amount)}
                          </td>
                          <td>
                            <span className="badge badge-muted">{tx.cryptoType}</span>
                          </td>
                          <td>
                            <span className={`badge ${status.cls}`}>{status.label}</span>
                          </td>
                          <td style={{ maxWidth: 200 }}>
                            {tx.adminNote
                              ? <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{tx.adminNote}</span>
                              : tx.description
                              ? <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{tx.description}</span>
                              : <span style={{ color: 'var(--text-muted)' }}>—</span>
                            }
                          </td>
                          <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                            {new Date(tx.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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
    </div>
  );
};

export default TransactionsPage;
