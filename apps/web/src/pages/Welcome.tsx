import { Link, Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Welcome() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-layout" style={{ flexDirection: 'column' }}>
      <header className="container" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', width: '100%' }}>
        <div className="app-brand" style={{ color: 'var(--text-main)' }}>
          <ShieldCheck size={28} color="var(--primary)" />
          <span>CtrlAltWin</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Log in</Link>
          <Link to="/create-account" className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Sign up</Link>
        </div>
      </header>
      
      <main className="hero" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1>Secure Authentication</h1>
        <p>A seamless, modern authentication experience powered by AWS Cognito and React. Fast, secure, and ready for production.</p>
        <div>
          <Link to="/create-account" className="btn btn-primary">Get Started</Link>
        </div>
      </main>
    </div>
  );
}
