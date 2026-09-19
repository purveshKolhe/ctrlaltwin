import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { UserPlus, Loader2, Check, X, Eye, EyeOff } from 'lucide-react';
import { signUp } from '../lib/authService';
import { useAuth } from '../contexts/AuthContext';
import { validatePassword } from '../lib/passwordValidation';

export default function CreateAccount() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const passwordErrors = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const usernameValid = username.length >= 3 && username.length <= 24 && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(username);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usernameValid) {
      setError('Username must be 3-24 characters, start with a letter, and contain only letters, numbers, and underscores.');
      return;
    }

    if (passwordErrors.length > 0) {
      setError('Please fix password requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signUp({ email, username, password, displayName });
      // On success, redirect to verify email
      navigate(`/verify-email?identifier=${encodeURIComponent(username)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
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
              <UserPlus color="var(--primary)" size={24} />
            </div>
          </div>
          <h2 className="auth-title">Create an account</h2>
          <p className="auth-subtitle">Join us to get started</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="displayName" className="form-label">Full Name</label>
            <input
              id="displayName"
              type="text"
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={loading}
              placeholder="Alex Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              placeholder="alex_doe123"
            />
            {username.length > 0 && !usernameValid && (
               <p style={{ fontSize: '0.75rem', color: 'var(--error)' }}>
                 3-24 chars, starts with a letter, only letters/numbers/underscores.
               </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Create a strong password"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <li style={{ color: password.length >= 8 ? 'var(--success)' : 'var(--error)' }}>
                  {password.length >= 8 ? <Check size={14} style={{verticalAlign:'middle', marginRight: 4}}/> : <X size={14} style={{verticalAlign:'middle', marginRight: 4}}/>} At least 8 characters
                </li>
                <li style={{ color: /[A-Z]/.test(password) ? 'var(--success)' : 'var(--error)' }}>
                  {/[A-Z]/.test(password) ? <Check size={14} style={{verticalAlign:'middle', marginRight: 4}}/> : <X size={14} style={{verticalAlign:'middle', marginRight: 4}}/>} One uppercase letter
                </li>
                <li style={{ color: /[a-z]/.test(password) ? 'var(--success)' : 'var(--error)' }}>
                  {/[a-z]/.test(password) ? <Check size={14} style={{verticalAlign:'middle', marginRight: 4}}/> : <X size={14} style={{verticalAlign:'middle', marginRight: 4}}/>} One lowercase letter
                </li>
                <li style={{ color: /[0-9]/.test(password) ? 'var(--success)' : 'var(--error)' }}>
                  {/[0-9]/.test(password) ? <Check size={14} style={{verticalAlign:'middle', marginRight: 4}}/> : <X size={14} style={{verticalAlign:'middle', marginRight: 4}}/>} One number
                </li>
                <li style={{ color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password) ? 'var(--success)' : 'var(--error)' }}>
                  {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password) ? <Check size={14} style={{verticalAlign:'middle', marginRight: 4}}/> : <X size={14} style={{verticalAlign:'middle', marginRight: 4}}/>} One special character
                </li>
              </ul>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                placeholder="Confirm your password"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
             {confirmPassword.length > 0 && !passwordsMatch && (
               <p style={{ fontSize: '0.75rem', color: 'var(--error)' }}>
                 Passwords do not match.
               </p>
             )}
          </div>

          {error && <div className="form-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="loading-spinner" size={18} />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <div className="nav-links">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
