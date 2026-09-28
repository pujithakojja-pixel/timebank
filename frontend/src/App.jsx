import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppLayout from './components/layout/AppLayout';
import LoadingScreen from './components/ui/LoadingScreen';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Explore = lazy(() => import('./pages/Explore'));
const Discover = lazy(() => import('./pages/Discover'));
const Matches = lazy(() => import('./pages/Matches'));
const Trades = lazy(() => import('./pages/Trades'));
const TradeDetail = lazy(() => import('./pages/TradeDetail'));
const Messages = lazy(() => import('./pages/Messages'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes inside AppLayout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/trades/:id" element={<TradeDetail />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'toast-custom',
              duration: 3000,
              style: {
                background: 'rgba(10, 10, 26, 0.95)',
                color: '#F0F0FF',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                fontSize: '0.9rem'
              }
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
