import React, { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { mockApi } from "../context/AuthContext";

const DEPOSIT_ADDRESSES = {
  BTC: "1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf8N",
  ETH: "0x742d35Cc6634C0532925a3b8D4C9b5B0e2Ac1d3",
  USDT: "TN7xsFBDqRGNFGqE9kMM7JfMXKiAdBs45B",
  BNB: "bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2",
  USD: "Bank Transfer — Contact support for bank details",
};

const DepositPage = () => {
  const [step, setStep] = useState(1); // 1=form, 2=send+upload, 3=success
  const [form, setForm] = useState({
    amount: "",
    cryptoType: "BTC",
    description: "",
  });
  const [proof, setProof] = useState(null); // File object
  const [proofBase64, setProofBase64] = useState(null); // base64 string sent to backend
  const [proofPreview, setProofPreview] = useState(null); // local preview URL
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return setError("File too large. Maximum 5MB.");
    if (!file.type.startsWith("image/"))
      return setError("Please upload an image file (PNG, JPG, JPEG).");
    setError("");
    setProof(file);
    setProofPreview(URL.createObjectURL(file));

    // Convert to base64 to send with the API call
    const reader = new FileReader();
    reader.onloadend = () => setProofBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESSES[form.cryptoType]);
    alert("Address copied!");
  };

  // Step 1 — submit deposit request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      return setError("Please enter a valid amount");
    }

    setStep(2);
  };

  // Step 2 — upload proof and finalize
  const handleUploadProof = async (e) => {
    e.preventDefault();
    setError("");

    if (!proof || !proofBase64) {
      return setError(
        "Please upload a screenshot of your payment before continuing.",
      );
    }

    setLoading(true);
    try {
      await mockApi.submitDeposit({
        amount: Number(form.amount),
        cryptoType: form.cryptoType,
        description: form.description,
        proofImage: proofBase64, // base64 image sent to backend
        proofName: proof.name,
      });
      setSuccess(
        "Deposit request submitted successfully with payment proof. Our team will review and credit your account within 24–48 hours.",
      );
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit proof");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["Enter Amount", "Send & Upload Proof", "Confirmed"];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Deposit Funds</h1>
          <p className="page-subtitle">
            Add funds to your CryptoVault investment account.
          </p>
        </div>
        <div className="page-content">
          <div style={{ maxWidth: 560 }}>
            {/* Step bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 100,
                    background:
                      step > i + 1
                        ? "var(--accent)"
                        : step === i + 1
                          ? "var(--accent)"
                          : "var(--border)",
                    opacity: step > i + 1 ? 1 : step === i + 1 ? 1 : 0.3,
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
              {STEPS.map((label, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: "0.68rem",
                    color:
                      step === i + 1
                        ? "var(--accent)"
                        : step > i + 1
                          ? "var(--success)"
                          : "var(--text-muted)",
                    fontWeight: step === i + 1 ? 700 : 400,
                  }}
                >
                  {step > i + 1 ? "✓" : label}
                </div>
              ))}
            </div>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="card">
                <h2
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    marginBottom: 20,
                  }}
                >
                  Deposit Request
                </h2>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmitRequest}>
                  <div className="form-group">
                    <label className="form-label">
                      Currency / Cryptocurrency
                    </label>
                    <select
                      name="cryptoType"
                      className="form-select"
                      value={form.cryptoType}
                      onChange={handleChange}
                    >
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="USDT">Tether (USDT)</option>
                      <option value="BNB">BNB</option>
                      <option value="USD">USD (Bank Transfer)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Amount (USD equivalent)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      className="form-input"
                      placeholder="e.g. 500"
                      value={form.amount}
                      onChange={handleChange}
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Note (optional)</label>
                    <input
                      type="text"
                      name="description"
                      className="form-input"
                      placeholder="e.g. Initial deposit"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="alert alert-info">
                    ℹ️ You will send funds to our wallet on the next step, then
                    upload a <strong>screenshot proof</strong> of your payment.
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-full btn-lg"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Continue →"}
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="card">
                <h2
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  Send Payment & Upload Proof
                </h2>

                {/* Wallet address box */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      marginBottom: 6,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Send {form.cryptoType} to this address
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      color: "var(--text-primary)",
                      wordBreak: "break-all",
                      marginBottom: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    {DEPOSIT_ADDRESSES[form.cryptoType]}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={copyAddress}
                      type="button"
                    >
                      📋 Copy Address
                    </button>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      Amount:{" "}
                      <strong style={{ color: "var(--text-primary)" }}>
                        {form.amount} USD
                      </strong>
                    </span>
                  </div>
                </div>

                <div
                  className="alert alert-warning"
                  style={{ marginBottom: 20 }}
                >
                  ⚠️ Send only <strong>{form.cryptoType}</strong> to this
                  address. After sending, upload your payment screenshot below.
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleUploadProof}>
                  <div className="form-group">
                    <label className="form-label">
                      📸 Upload Payment Screenshot *
                    </label>
                    <div
                      onClick={() => fileRef.current.click()}
                      style={{
                        border: `2px dashed ${proof ? "var(--success)" : "var(--border)"}`,
                        borderRadius: "var(--radius-md)",
                        padding: 28,
                        textAlign: "center",
                        cursor: "pointer",
                        background: proof
                          ? "var(--success-light)"
                          : "var(--bg-secondary)",
                        transition: "all 0.2s",
                      }}
                    >
                      {proofPreview ? (
                        <img
                          src={proofPreview}
                          alt="proof"
                          style={{
                            maxWidth: "100%",
                            maxHeight: 220,
                            borderRadius: 8,
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <>
                          <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>
                            📸
                          </div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              marginBottom: 4,
                            }}
                          >
                            Click to upload screenshot
                          </div>
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            PNG, JPG, JPEG — max 5MB
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                    {proof && (
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--success)",
                          }}
                        >
                          ✓ {proof.name}
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setProof(null);
                            setProofPreview(null);
                            setProofBase64(null);
                            fileRef.current.value = "";
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-full btn-lg"
                    disabled={!proof || loading}
                  >
                    {loading ? "Submitting..." : "Submit with Proof →"}
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "4rem", marginBottom: 16 }}>✅</div>
                <h2
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  Deposit Submitted!
                </h2>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: 20,
                    fontSize: "0.9rem",
                    lineHeight: 1.7,
                  }}
                >
                  {success}
                </p>
                {proofPreview && (
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                      }}
                    >
                      Your uploaded proof:
                    </div>
                    <img
                      src={proofPreview}
                      alt="proof"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 160,
                        borderRadius: 8,
                        objectFit: "contain",
                        border: "1px solid var(--border)",
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setStep(1);
                      setForm({
                        amount: "",
                        cryptoType: "BTC",
                        description: "",
                      });
                      setProof(null);
                      setProofPreview(null);
                      setProofBase64(null);
                    }}
                  >
                    Make Another Deposit
                  </button>
                  <a href="/transactions" className="btn btn-primary">
                    View Transactions
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DepositPage;
