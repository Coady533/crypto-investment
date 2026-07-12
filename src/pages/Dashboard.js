import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../context/AuthContext";
import { formatUsdPrice, useCryptoMarket } from "../utils/cryptoMarket";

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { market, fallbackPrices } = useCryptoMarket();

  useEffect(() => {
    const load = async () => {
      await refreshUser();
      const txs = await mockApi.getMyTransactions();
      setTransactions(txs.slice(0, 5));
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, []);

  const portfolioValue = user
    ? Object.entries(user.portfolio || {}).reduce(
        (sum, [coin, amount]) =>
          sum + amount * (market[coin]?.price || fallbackPrices[coin] || 0),
        0,
      )
    : 0;

  const statusColor = {
    completed: "badge-success",
    pending: "badge-warning",
    rejected: "badge-danger",
    code_required: "badge-accent",
    codes_submitted: "badge-accent",
    approved: "badge-success",
  };

  const fmt = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n || 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Welcome back, {user?.firstName} 👋</h1>
          <p className="page-subtitle">
            Here's an overview of your investment portfolio.
          </p>
        </div>
        <div className="page-content">
          {user?.accountStatus !== "active" && (
            <div className="alert alert-warning" style={{ marginBottom: 24 }}>
              ⏳ Your account is <strong>{user?.accountStatus}</strong>. Some
              features may be restricted until an admin activates your account.
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-label">💰 Total Balance</div>
              <div className="stat-card-value">{fmt(user?.balance)}</div>
              <div className="stat-card-change">Available to withdraw</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">📈 Portfolio Value</div>
              <div className="stat-card-value accent">
                {fmt(portfolioValue)}
              </div>
              <div className="stat-card-change">Crypto holdings</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">💵 Total Invested</div>
              <div className="stat-card-value">{fmt(user?.totalInvested)}</div>
              <div className="stat-card-change">Lifetime deposits</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">✅ Total Profit</div>
              <div className="stat-card-value success">
                {fmt(user?.totalProfit)}
              </div>
              <div className="stat-card-change">Earnings to date</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 700,
                marginBottom: 16,
                fontSize: "1rem",
              }}
            >
              Quick Actions
            </h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/deposit" className="btn btn-primary">
                ↓ Deposit Funds
              </Link>
              <Link to="/withdraw" className="btn btn-secondary">
                ↑ Withdraw
              </Link>
              <Link to="/transactions" className="btn btn-secondary">
                ≡ All Transactions
              </Link>
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            {/* Portfolio */}
            <div className="card">
              <h2
                style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: 700,
                  marginBottom: 16,
                  fontSize: "1rem",
                }}
              >
                Portfolio Breakdown
              </h2>
              {Object.entries(user?.portfolio || {}).map(([coin, amount]) => {
                const price = market[coin]?.price || fallbackPrices[coin] || 0;
                const value = amount * price;
                const coinColors = {
                  BTC: "#f7931a",
                  ETH: "#627eea",
                  USDT: "#22c55e",
                  BNB: "#f3ba2f",
                };
                return (
                  <div
                    key={coin}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: `${coinColors[coin]}22`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: coinColors[coin],
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {coin[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                          {coin}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {amount.toFixed(6)}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {fmt(value)}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {formatUsdPrice(price)}/unit
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Transactions */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  Recent Transactions
                </h2>
                <Link
                  to="/transactions"
                  style={{ fontSize: "0.82rem", color: "var(--accent)" }}
                >
                  View all
                </Link>
              </div>
              {loading && (
                <div
                  style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}
                >
                  Loading...
                </div>
              )}
              {!loading &&
                transactions.map((tx) => (
                  <div
                    key={tx._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background:
                            tx.type === "deposit"
                              ? "var(--success-light)"
                              : "var(--danger-light)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.9rem",
                        }}
                      >
                        {tx.type === "deposit" ? "↓" : "↑"}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 500,
                            fontSize: "0.88rem",
                            textTransform: "capitalize",
                          }}
                        >
                          {tx.type}
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          color:
                            tx.type === "deposit"
                              ? "var(--success)"
                              : "var(--danger)",
                        }}
                      >
                        {tx.type === "deposit" ? "+" : "-"}
                        {fmt(tx.amount)}
                      </div>
                      <span
                        className={`badge ${statusColor[tx.status] || "badge-muted"}`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
