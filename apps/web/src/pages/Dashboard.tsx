import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../lib/authService';

export default function Dashboard() {
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
            <Link to="/dashboard" className="active">Dashboard</Link>
            <Link to="/profile">Profile</Link>
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
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User color="var(--primary)" />
            Welcome back, {user?.username || 'User'}!
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            This is your authenticated dashboard. You can only see this page if you are logged in.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h3>Recent Activity</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent activity to display.</p>
          </div>
          <div className="card">
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <Link to="/profile" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>View Profile Settings</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
