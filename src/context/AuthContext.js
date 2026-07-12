import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

// ─── Single axios instance pointing directly at backend ───────────────────────
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to set/remove auth token on the instance
export const setAuthToken = (token) => {
  if (token) API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete API.defaults.headers.common["Authorization"];
};

// ─── Investment Plans (local) ─────────────────────────────────────────────────
export const INITIAL_PLANS = [
  {
    id: "plan_01",
    name: "Basic",
    badge: "🌱",
    minDeposit: 100,
    maxDeposit: 999,
    roiPercent: 5,
    durationDays: 14,
    dailyReturn: 0.36,
    features: [
      "5% ROI after 14 days",
      "24/7 support",
      "Instant activation",
      "BTC & USDT supported",
    ],
    color: "#22c55e",
    highlight: false,
    description:
      "Perfect for beginners looking to start their crypto investment journey.",
  },
  {
    id: "plan_02",
    name: "Standard",
    badge: "⭐",
    minDeposit: 1000,
    maxDeposit: 4999,
    roiPercent: 15,
    durationDays: 30,
    dailyReturn: 0.5,
    features: [
      "15% ROI after 30 days",
      "0.5% daily interest",
      "Priority support",
      "All coins supported",
      "Reinvestment option",
    ],
    color: "#6c63ff",
    highlight: true,
    description: "Our most popular plan for consistent mid-term growth.",
  },
  {
    id: "plan_03",
    name: "Premium",
    badge: "💎",
    minDeposit: 5000,
    maxDeposit: 49999,
    roiPercent: 30,
    durationDays: 60,
    dailyReturn: 0.5,
    features: [
      "30% ROI after 60 days",
      "0.5% daily interest",
      "VIP account manager",
      "All coins supported",
      "Compounding option",
      "Early withdrawal available",
    ],
    color: "#f59e0b",
    highlight: false,
    description:
      "Maximum returns for serious investors with a 60-day commitment.",
  },
  {
    id: "plan_04",
    name: "Elite",
    badge: "🚀",
    minDeposit: 50000,
    maxDeposit: null,
    roiPercent: 50,
    durationDays: 90,
    dailyReturn: 0.56,
    features: [
      "50% ROI after 90 days",
      "0.56% daily interest",
      "Dedicated relationship manager",
      "All coins supported",
      "Custom withdrawal schedule",
      "Quarterly bonuses",
      "Tax reporting assistance",
    ],
    color: "#ec4899",
    highlight: false,
    description:
      "Exclusive institutional-grade plan for high-net-worth investors.",
  },
];

// ─── Live Activity Feed ───────────────────────────────────────────────────────
export const LIVE_ACTIVITY = [
  {
    name: "James W.",
    country: "United Kingdom",
    amount: 5000,
    type: "deposit",
    plan: "Standard",
  },
  {
    name: "Amaka O.",
    country: "Nigeria",
    amount: 1200,
    type: "deposit",
    plan: "Basic",
  },
  {
    name: "Chen L.",
    country: "Singapore",
    amount: 8500,
    type: "investment",
    plan: "Premium",
  },
  {
    name: "Sofia R.",
    country: "Brazil",
    amount: 3000,
    type: "deposit",
    plan: "Standard",
  },
  {
    name: "Marcus T.",
    country: "United States",
    amount: 52000,
    type: "investment",
    plan: "Elite",
  },
  {
    name: "Yuki N.",
    country: "Japan",
    amount: 750,
    type: "deposit",
    plan: "Basic",
  },
  {
    name: "Ibrahim K.",
    country: "UAE",
    amount: 15000,
    type: "investment",
    plan: "Premium",
  },
  {
    name: "Priya S.",
    country: "India",
    amount: 2500,
    type: "deposit",
    plan: "Standard",
  },
  {
    name: "Carlos M.",
    country: "Spain",
    amount: 9800,
    type: "investment",
    plan: "Premium",
  },
  {
    name: "Fatima A.",
    country: "South Africa",
    amount: 1800,
    type: "deposit",
    plan: "Standard",
  },
  {
    name: "Liam B.",
    country: "Australia",
    amount: 6200,
    type: "investment",
    plan: "Premium",
  },
  {
    name: "Anna K.",
    country: "Germany",
    amount: 500,
    type: "deposit",
    plan: "Basic",
  },
];

// ─── API Methods ──────────────────────────────────────────────────────────────
export const mockApi = {
  // Auth
  login: async (email, password) => {
    const res = await API.post("/api/auth/login", { email, password });
    return res.data;
  },
  register: async (data) => {
    const res = await API.post("/api/auth/register", data);
    return res.data;
  },
  getMe: async () => {
    const res = await API.get("/api/auth/me");
    return res.data;
  },

  // Transactions
  getMyTransactions: async () => {
    const res = await API.get("/api/transactions/my");
    return res.data;
  },
  submitDeposit: async (data) => {
    const res = await API.post("/api/transactions/deposit", data);
    return res.data;
  },
  submitWithdraw: async (data) => {
    const res = await API.post("/api/transactions/withdraw", data);
    return res.data;
  },
  verifyCodes: async (data) => {
    const res = await API.post("/api/transactions/withdraw/verify-codes", data);
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await API.patch("/api/user/profile", data);
    return res.data;
  },

  // Plans (local)
  getPlans: async () => INITIAL_PLANS,
  getAdminPlans: async () => INITIAL_PLANS,
  investInPlan: async ({ planId, amount, cryptoType }) => {
    const plan = INITIAL_PLANS.find((p) => p.id === planId);
    const res = await API.post("/api/transactions/deposit", {
      amount,
      cryptoType,
      description: `${plan?.name} Plan — ${plan?.durationDays} days investment`,
    });
    return {
      message: `Investment request submitted for ${plan?.name} Plan!`,
      transaction: res.data.transaction,
    };
  },
  updatePlan: async (id, updates) => {
    const idx = INITIAL_PLANS.findIndex((p) => p.id === id);
    if (idx > -1) Object.assign(INITIAL_PLANS[idx], updates);
    return { plan: INITIAL_PLANS[idx] };
  },
  createPlan: async (plan) => {
    const p = { ...plan, id: "plan_" + Date.now() };
    INITIAL_PLANS.push(p);
    return { plan: p };
  },
  deletePlan: async (id) => {
    const idx = INITIAL_PLANS.findIndex((p) => p.id === id);
    if (idx > -1) INITIAL_PLANS.splice(idx, 1);
    return { message: "Deleted" };
  },

  // Admin
  getAdminStats: async () => {
    const res = await API.get("/api/admin/stats");
    return res.data;
  },
  getAdminUsers: async (pendingOnly) => {
    const url = pendingOnly ? "/api/admin/users/pending" : "/api/admin/users";
    const res = await API.get(url);
    return res.data;
  },
  getAdminUserById: async (id) => {
    const res = await API.get(`/api/admin/users/${id}`);
    return res.data;
  },
  approveUser: async (id) => {
    const res = await API.patch(`/api/admin/users/${id}/approve`);
    return res.data;
  },
  suspendUser: async (id) => {
    const res = await API.patch(`/api/admin/users/${id}/suspend`);
    return res.data;
  },
  issueCodes: async (id, data) => {
    const res = await API.post(`/api/admin/users/${id}/issue-codes`, data);
    return res.data;
  },
  updateBalance: async (id, data) => {
    const res = await API.patch(`/api/admin/users/${id}/balance`, data);
    return res.data;
  },
  getAdminTransactions: async (params = {}) => {
    const res = await API.get("/api/admin/transactions", { params });
    return res.data;
  },
  approveTransaction: async (id, data) => {
    const res = await API.patch(`/api/admin/transactions/${id}/approve`, data);
    return res.data;
  },
  rejectTransaction: async (id, data) => {
    const res = await API.patch(`/api/admin/transactions/${id}/reject`, data);
    return res.data;
  },
};

// ─── Auth Context ─────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("cv_token") || null);
  const [loading, setLoading] = useState(true);

  // Keep token on API instance in sync
  useEffect(() => {
    setAuthToken(token);
    if (token) localStorage.setItem("cv_token", token);
    else localStorage.removeItem("cv_token");
  }, [token]);

  // Load logged-in user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await mockApi.getMe();
        setUser(userData);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await mockApi.login(email, password);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (data) => mockApi.register(data);
  const logout = () => {
    setToken(null);
    setUser(null);
  };
  const refreshUser = async () => {
    if (!token) return;
    try {
      const u = await mockApi.getMe();
      setUser(u);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
