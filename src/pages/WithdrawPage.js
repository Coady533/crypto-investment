import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../context/AuthContext';

const WithdrawPage = () => {
  const { user, refreshUser } = useAuth();
  // Steps: 1=request details, 2=auth code, 3=policy code, 4=done
  const [step,        setStep]        = useState(1);
  const [withdrawType, setWithdrawType] = useState('crypto'); // 'crypto' | 'bank'
  const [form,        setForm]        = useState({
    amount: '', cryptoType: 'BTC',
    // crypto
    walletAddress: '',
    // bank
    bankName: '', accountName: '', accountNumber: '', routingNumber: '', swiftCode: ''
  });
  const [authCode,   setAuthCode]   = useState('');
  const [policyCode, setPolicyCode] = useState('');
  const [txId,       setTxId]       = useState(null);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [loading,    setLoading]    = useState(false);

  useEffect(() => { refreshUser(); }, []); // eslint-disable-line

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Step 1: Submit withdrawal request ──────────────────────────────────────
  const handleWithdrawRequest = async e => {
    e.preventDefault(); setError('');
    const amt = Number(form.amount);
    if (!amt || amt <= 0)                   return setError('Please enter a valid amount');
    if (amt > (user?.balance || 0))         return setError('Insufficient balance');
    if (withdrawType === 'crypto' && !form.walletAddress.trim())
                                            return setError('Please enter your wallet address');
    if (withdrawType === 'bank') {
      if (!form.bankName.trim())            return setError('Please enter your bank name');
      if (!form.accountName.trim())         return setError('Please enter the account name');
      if (!form.accountNumber.trim())       return setError('Please enter the account number');
    }
    setLoading(true);
    try {
      const payload = {
        amount:        amt,
        cryptoType:    withdrawType === 'bank' ? 'USD' : form.cryptoType,
        walletAddress: withdrawType === 'crypto' ? form.walletAddress : null,
        bankDetails:   withdrawType === 'bank' ? {
          bankName:      form.bankName,
          accountName:   form.accountName,
          accountNumber: form.accountNumber,
          routingNumber: form.routingNumber,
          swiftCode:     form.swiftCode,
        } : null,
      };
      const res = await mockApi.submitWithdraw(payload);
      setTxId(res.transaction._id);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit withdrawal');
    } finally { setLoading(false); }
  };

  // ── Step 2: Auth code ──────────────────────────────────────────────────────
  const handleAuthCode = e => {
    e.preventDefault(); setError('');
    if (!authCode.trim()) return setError('Please enter your Authentication Code');
    setStep(3);
  };

  // ── Step 3: Policy code + verify ──────────────────────────────────────────
  const handlePolicyCode = async e => {
    e.preventDefault(); setError('');
    if (!policyCode.trim()) return setError('Please enter your Policy Code');
    setLoading(true);
    try {
      const res = await mockApi.verifyCodes({ transactionId: txId, authCode, policyCode });
      setSuccess(res.message);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Code verification failed. Check your codes and try again.');
    } finally { setLoading(false); }
  };

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
  const STEPS = ['Withdrawal Details', 'Auth Code', 'Policy Code', 'Complete'];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Withdraw Funds</h1>
          <p className="page-subtitle">Securely withdraw from your investment account.</p>
        </div>
        <div className="page-content">
          <div style={{ maxWidth: 580 }}>

            {/* Balance card */}
            <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>AVAILABLE BALANCE</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.8rem', fontWeight: 800 }}>{fmt(user?.balance)}</div>
              </div>
              <div style={{ fontSize: '2.5rem' }}>💳</div>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 100,
                  background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--accent)' : 'var(--border)',
                  transition: 'background 0.3s'
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
              {STEPS.map((label, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.66rem', color: step === i + 1 ? 'var(--accent)' : step > i + 1 ? 'var(--success)' : 'var(--text-muted)', fontWeight: step === i + 1 ? 700 : 400 }}>
                  {step > i + 1 ? '✓' : label}
                </div>
              ))}
            </div>

            {/* ── STEP 1: Withdrawal Details ── */}
            {step === 1 && (
              <div className="card">
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 20 }}>Withdrawal Details</h2>
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleWithdrawRequest}>
                  {/* Amount */}
                  <div className="form-group">
                    <label className="form-label">Amount (USD)</label>
                    <input type="number" name="amount" className="form-input"
                      placeholder="Enter amount" value={form.amount}
                      onChange={handleChange} min="1" step="0.01" required />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Available: {fmt(user?.balance)}
                    </div>
                  </div>

                  {/* Withdrawal method toggle */}
                  <div className="form-group">
                    <label className="form-label">Withdrawal Method</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setWithdrawType('crypto')}
                        style={{
                          flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                          border: `2px solid ${withdrawType === 'crypto' ? 'var(--accent)' : 'var(--border)'}`,
                          background: withdrawType === 'crypto' ? 'var(--accent-light)' : 'var(--bg-secondary)',
                          color: withdrawType === 'crypto' ? 'var(--accent)' : 'var(--text-secondary)',
                          fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s'
                        }}
                      >
                        ₿ Cryptocurrency
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawType('bank')}
                        style={{
                          flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                          border: `2px solid ${withdrawType === 'bank' ? 'var(--accent)' : 'var(--border)'}`,
                          background: withdrawType === 'bank' ? 'var(--accent-light)' : 'var(--bg-secondary)',
                          color: withdrawType === 'bank' ? 'var(--accent)' : 'var(--text-secondary)',
                          fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s'
                        }}
                      >
                        🏦 Bank Transfer
                      </button>
                    </div>
                  </div>

                  {/* ── Crypto fields ── */}
                  {withdrawType === 'crypto' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Cryptocurrency</label>
                        <select name="cryptoType" className="form-select" value={form.cryptoType} onChange={handleChange}>
                          <option value="BTC">Bitcoin (BTC)</option>
                          <option value="ETH">Ethereum (ETH)</option>
                          <option value="USDT">Tether (USDT)</option>
                          <option value="BNB">BNB</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Wallet Address *</label>
                        <input type="text" name="walletAddress" className="form-input"
                          placeholder="Enter your wallet address"
                          value={form.walletAddress} onChange={handleChange}
                          style={{ fontFamily: 'monospace' }} required />
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          Double-check the address. Crypto transactions are irreversible.
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── Bank fields ── */}
                  {withdrawType === 'bank' && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Bank Name *</label>
                          <input type="text" name="bankName" className="form-input"
                            placeholder="e.g. First Bank" value={form.bankName} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Account Name *</label>
                          <input type="text" name="accountName" className="form-input"
                            placeholder="Full name on account" value={form.accountName} onChange={handleChange} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Account Number *</label>
                        <input type="text" name="accountNumber" className="form-input"
                          placeholder="Enter account number" value={form.accountNumber}
                          onChange={handleChange} required style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }} />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Routing Number</label>
                          <input type="text" name="routingNumber" className="form-input"
                            placeholder="For US banks" value={form.routingNumber}
                            onChange={handleChange} style={{ fontFamily: 'monospace' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">SWIFT / BIC Code</label>
                          <input type="text" name="swiftCode" className="form-input"
                            placeholder="For international" value={form.swiftCode}
                            onChange={handleChange} style={{ fontFamily: 'monospace', textTransform: 'uppercase' }} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="alert alert-warning">
                    🔐 This withdrawal requires an <strong>Authentication Code</strong> and <strong>Policy Code</strong> from admin to process.
                  </div>

                  <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Withdrawal Request →'}
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 2: Authentication Code ── */}
            {step === 2 && (
              <div className="card">
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: 10 }}>🔑</div>
                  <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 8 }}>
                    Authentication Code
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Enter the <strong>Authentication Code</strong> issued by our admin team.<br />
                    Contact support if you have not received it yet.
                  </p>
                </div>

                <div className="alert alert-info" style={{ marginBottom: 20, fontSize: '0.82rem' }}>
                  📋 <strong>Transaction ID:</strong> <span style={{ fontFamily: 'monospace' }}>{txId}</span>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleAuthCode}>
                  <div className="form-group">
                    <label className="form-label">Authentication Code</label>
                    <input
                      type="text" className="form-input"
                      placeholder="e.g. AUTH-A1B2C3D4"
                      value={authCode}
                      onChange={e => { setAuthCode(e.target.value.toUpperCase()); setError(''); }}
                      required
                      style={{ letterSpacing: '0.15em', fontFamily: 'monospace', fontSize: '1.15rem', textAlign: 'center' }}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                      Issued by CryptoVault admin team
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-full btn-lg">
                    Verify Auth Code →
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 3: Policy Code ── */}
            {step === 3 && (
              <div className="card">
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: 10 }}>📋</div>
                  <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 8 }}>
                    Policy Code
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Now enter your <strong>Policy Code</strong> — the second and final security code required to release your funds.
                  </p>
                </div>

                <div className="alert alert-success" style={{ marginBottom: 20 }}>
                  ✓ Authentication Code accepted successfully
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handlePolicyCode}>
                  <div className="form-group">
                    <label className="form-label">Policy Code</label>
                    <input
                      type="text" className="form-input"
                      placeholder="e.g. POL-E5F6G7H8"
                      value={policyCode}
                      onChange={e => { setPolicyCode(e.target.value.toUpperCase()); setError(''); }}
                      required
                      style={{ letterSpacing: '0.15em', fontFamily: 'monospace', fontSize: '1.15rem', textAlign: 'center' }}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                      From your withdrawal policy agreement
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                    {loading ? 'Verifying...' : '✓ Complete Withdrawal'}
                  </button>
                </form>

                <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}
                  onClick={() => { setStep(2); setError(''); }}>
                  ← Back to Auth Code
                </button>
              </div>
            )}

            {/* ── STEP 4: Done ── */}
            {step === 4 && (
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, marginBottom: 8 }}>
                  Withdrawal Submitted!
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {success || 'Both codes verified successfully.'}<br /><br />
                  Your withdrawal is in final admin review. Funds will be sent within <strong>24–72 hours</strong>.
                </p>

                {/* Summary */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 24, textAlign: 'left' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                    Withdrawal Summary
                  </div>
                  {[
                    ['Amount',  fmt(Number(form.amount))],
                    ['Method',  withdrawType === 'bank' ? '🏦 Bank Transfer' : `₿ Crypto (${form.cryptoType})`],
                    withdrawType === 'crypto'
                      ? ['Wallet', form.walletAddress]
                      : ['Bank',   `${form.bankName} — ${form.accountNumber}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                      <span style={{ fontWeight: 600, wordBreak: 'break-all', maxWidth: '65%', textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href="/transactions" className="btn btn-primary">View Transactions</a>
                  <a href="/dashboard"    className="btn btn-secondary">Back to Dashboard</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WithdrawPage;
