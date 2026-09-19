import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, Loader2 } from 'lucide-react';
import { confirmSignUpEmail, resendSignUpCode } from '../lib/authService';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const identifierParam = searchParams.get('identifier') || searchParams.get('email') || '';
  
  const [identifier, setIdentifier] = useState(identifierParam);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await confirmSignUpEmail(identifier, code);
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify email. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    setSuccess('');
    setResending(true);
    try {
      await resendSignUpCode(identifier);
      setSuccess('Verification code resent successfully.');
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: '50%', border: '1px solid var(--border-color)' }}>
              <MailCheck color="var(--primary)" size={24} />
            </div>
          </div>
          <h2 className="auth-title">Check your email</h2>
          <p className="auth-subtitle">We sent a verification code to your email.</p>
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
            <label htmlFor="code" className="form-label">Verification Code</label>
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

          {error && <div className="form-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          {success && <div style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginBottom: '1rem' }}>
            {loading ? (
              <>
                <Loader2 className="loading-spinner" size={18} />
                Verifying...
              </>
            ) : (
              'Verify email'
            )}
          </button>
          
          <button
            type="button"
            className="btn"
            onClick={handleResend}
            disabled={loading || resending || cooldown > 0 || !identifier}
            style={{ 
              backgroundColor: 'transparent', 
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)'
            }}
          >
            {resending ? (
              <><Loader2 className="loading-spinner" size={18} /> Resending...</>
            ) : cooldown > 0 ? (
              `Resend code in ${cooldown}s`
            ) : (
              'Resend code'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
