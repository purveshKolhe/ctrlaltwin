import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Loader2 } from 'lucide-react';
import { resetPassword } from '../lib/authService';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(identifier);
      navigate(`/reset-password?identifier=${encodeURIComponent(identifier)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: '50%', border: '1px solid var(--border-color)' }}>
              <KeyRound color="var(--primary)" size={24} />
            </div>
          </div>
          <h2 className="auth-title">Forgot password?</h2>
          <p className="auth-subtitle">No worries, we'll send you reset instructions.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="identifier" className="form-label">Username or email</label>
            <input
              id="identifier"
              type="text"
              className="form-input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={loading}
              placeholder="Username or email"
            />
          </div>

          {error && <div className="form-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginBottom: '1rem' }}>
            {loading ? (
              <>
                <Loader2 className="loading-spinner" size={18} />
                Sending...
              </>
            ) : (
              'Reset password'
            )}
          </button>
          
          <Link to="/login" className="btn btn-secondary" style={{ display: 'flex' }}>
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}
