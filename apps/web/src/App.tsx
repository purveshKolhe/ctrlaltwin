import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NoiseOverlay } from './components/NoiseOverlay';

// Showcase & Studio Pages
import Home from './pages/Home';
import Studio from './pages/Studio';
import Auth from './pages/Auth';

// Existing Auth Pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

import { USE_MOCK } from './lib/authService';

export default function App() {
  return (
    <AuthProvider>
      <NoiseOverlay />
      {USE_MOCK && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#f59e0b',
          color: 'white',
          textAlign: 'center',
          padding: '0.25rem',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          zIndex: 9999
        }}>
          DEMO MODE ACTIVE (Mock Auth) - No real emails are sent.
        </div>
      )}
      <Router>
        <Routes>
          {/* Main Showcase & Studio Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/auth" element={<Auth />} />

          {/* Auth Flow Routes */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'hsl(0 0% 8%)',
            border: '1px solid hsl(0 0% 15%)',
            color: 'hsl(60 10% 96%)',
            fontFamily: 'JetBrains Mono, monospace',
          },
        }}
      />
    </AuthProvider>
  );
}

