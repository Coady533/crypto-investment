import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import AboutPage        from './pages/AboutPage';
import ServicesPage     from './pages/ServicesPage';
import PlansPage        from './pages/PlansPage';
import ContactPage      from './pages/ContactPage';
import FAQPage          from './pages/FAQPage';

// User pages
import Dashboard          from './pages/Dashboard';
import DepositPage        from './pages/DepositPage';
import WithdrawPage       from './pages/WithdrawPage';
import TransactionsPage   from './pages/TransactionsPage';
import ProfilePage        from './pages/ProfilePage';
import InvestPage         from './pages/InvestPage';
import MyInvestmentsPage  from './pages/MyInvestmentsPage';
import CopyTradingPage    from './pages/CopyTradingPage';

// Admin pages
import AdminDashboard     from './pages/admin/AdminDashboard';
import AdminUsers         from './pages/admin/AdminUsers';
import AdminUserDetail    from './pages/admin/AdminUserDetail';
import AdminTransactions  from './pages/admin/AdminTransactions';
import AdminPlans         from './pages/admin/AdminPlans';
import AdminCopyTrading   from './pages/admin/AdminCopyTrading';

import './styles/global.css';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user)    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/about"    element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/plans"    element={<PlansPage />} />
      <Route path="/contact"  element={<ContactPage />} />
      <Route path="/faq"      element={<FAQPage />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* User */}
      <Route path="/dashboard"       element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/deposit"         element={<PrivateRoute><DepositPage /></PrivateRoute>} />
      <Route path="/withdraw"        element={<PrivateRoute><WithdrawPage /></PrivateRoute>} />
      <Route path="/transactions"    element={<PrivateRoute><TransactionsPage /></PrivateRoute>} />
      <Route path="/profile"         element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/invest"          element={<PrivateRoute><InvestPage /></PrivateRoute>} />
      <Route path="/my-investments"  element={<PrivateRoute><MyInvestmentsPage /></PrivateRoute>} />
      <Route path="/copy-trading"    element={<PrivateRoute><CopyTradingPage /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin"                    element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/users"              element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
      <Route path="/admin/users/:id"          element={<PrivateRoute adminOnly><AdminUserDetail /></PrivateRoute>} />
      <Route path="/admin/transactions"       element={<PrivateRoute adminOnly><AdminTransactions /></PrivateRoute>} />
      <Route path="/admin/plans"              element={<PrivateRoute adminOnly><AdminPlans /></PrivateRoute>} />
      <Route path="/admin/copy-trading"       element={<PrivateRoute adminOnly><AdminCopyTrading /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
