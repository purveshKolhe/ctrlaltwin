import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../lib/authService';

export default function Profile() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutUser();
      await checkAuth();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <header className="app-header">
        <div className="container">
          <div className="app-brand" style={{ color: 'var(--primary)' }}>
            <ShieldCheck size={24} />
            <span>CtrlAltWin</span>
          </div>
          <nav className="app-nav">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile" className="active">Profile</Link>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary" 
              style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.875rem', gap: '0.5rem' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main container">
        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Settings color="var(--primary)" />
            Profile Settings
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Display Name
              </span>
              <strong style={{ fontSize: '1.125rem' }}>{user?.displayName || user?.username || 'Unknown'}</strong>
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Username / ID: {user?.username || 'Unknown'}
              </div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Account Status
              </span>
              <strong style={{ fontSize: '1.125rem', color: '#10b981' }}>Active & Verified</strong>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              Sign out from all devices
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
