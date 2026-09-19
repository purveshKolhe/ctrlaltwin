import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Loader2, Check, X, Eye, EyeOff } from 'lucide-react';
import { confirmPasswordReset } from '../lib/authService';
import { validatePassword } from '../lib/passwordValidation';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const identifierParam = searchParams.get('identifier') || searchParams.get('email') || '';
  
  const [identifier, setIdentifier] = useState(identifierParam);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordErrors = validatePassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (passwordErrors.length > 0) {
      setError('Please fix password requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(identifier, code, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check the code.');
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
              <ShieldCheck color="var(--primary)" size={24} />
            </div>
          </div>
          <h2 className="auth-title">Set new password</h2>
          <p className="auth-subtitle">Enter your code and new password</p>
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
              disabled={loading || !!identifierParam}
              placeholder="Username or email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="code" className="form-label">Reset Code</label>
            <input
              id="code"
              type="text"
              className="form-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={loading}
              placeholder="123456"
              style={{ letterSpacing: '0.25rem', textAlign: 'center', fontSize: '1.25rem' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                placeholder="Enter new password"
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
            {newPassword.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <li style={{ color: newPassword.length >= 8 ? 'var(--success)' : 'var(--error)' }}>
                  {newPassword.length >= 8 ? <Check size={14} style={{verticalAlign:'middle', marginRight: 4}}/> : <X size={14} style={{verticalAlign:'middle', marginRight: 4}}/>} At least 8 characters
                </li>
                <li style={{ color: /[A-Z]/.test(newPassword) ? 'var(--success)' : 'var(--error)' }}>
                  {/[A-Z]/.test(newPassword) ? <Check size={14} style={{verticalAlign:'middle', marginRight: 4}}/> : <X size={14} style={{verticalAlign:'middle', marginRight: 4}}/>} One uppercase letter
                </li>
                <li style={{ color: /[a-z]/.test(newPassword) ? 'var(--success)' : 'var(--error)' }}>
                  {/[a-z]/.test(newPassword) ? <Check size={14} style={{verticalAlign:'middle', marginRight: 4}}/> : <X size={14} style={{verticalAlign:'middle', marginRight: 4}}/>} One lowercase letter
                </li>
                <li style={{ color: /[0-9]/.test(newPassword) ? 'var(--success)' : 'var(--error)' }}>
                  {/[0-9]/.test(newPassword) ? <Check size={14} style={{verticalAlign:'middle', marginRight: 4}}/> : <X size={14} style={{verticalAlign:'middle', marginRight: 4}}/>} One number
                </li>
                <li style={{ color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(newPassword) ? 'var(--success)' : 'var(--error)' }}>
                  {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(newPassword) ? <Check size={14} style={{verticalAlign:'middle', marginRight: 4}}/> : <X size={14} style={{verticalAlign:'middle', marginRight: 4}}/>} One special character
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
                placeholder="Confirm new password"
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
          </div>

          {error && <div className="form-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          {success && <div style={{ color: 'var(--success)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="loading-spinner" size={18} />
                Resetting...
              </>
            ) : (
              'Set new password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
