import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  UserPlus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { signIn, signUp } from '../lib/authService';
import { validatePassword } from '../lib/passwordValidation';

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sign In fields
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();

  // If already logged in, redirect to studio
  if (user) {
    return <Navigate to="/studio" replace />;
  }

  const passwordErrors = validatePassword(signupPassword);
  const passwordsMatch = signupPassword === confirmPassword && signupPassword.length > 0;
  const usernameValid =
    username.length >= 3 && username.length <= 24 && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(username);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !loginPassword.trim()) {
      setError('Please provide both your username/email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(identifier.trim(), loginPassword);
      await checkAuth();
      toast.success('Signed in successfully. Welcome!');
      navigate('/studio');
    } catch (err: any) {
      const msg = err?.message || 'Failed to sign in. Please check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim() || !username.trim() || !email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!usernameValid) {
      setError('Username must be 3-24 characters, start with a letter, and contain only letters, numbers, and underscores.');
      return;
    }

    if (passwordErrors.length > 0) {
      setError('Please satisfy all password requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email: email.trim(),
        username: username.trim(),
        password: signupPassword,
        displayName: displayName.trim(),
      });
      toast.success('Account created! Please verify your email.');
      navigate(`/verify-email?identifier=${encodeURIComponent(username.trim())}`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to create account.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16">
      {/* Decorative ambient gradients */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl" />

      <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl md:p-8">
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </button>
          <div className="flex items-center gap-1.5">
            <span className="onair-dot h-2 w-2 rounded-full bg-primary" />
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-primary">
              Presenter
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
              mode === 'signin'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" /> Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
              mode === 'signup'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" /> Register
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
            {error}
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Username or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com or username"
                className="auth-input text-sm"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="font-mono text-[0.7rem] text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  className="auth-input pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cta-primary mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Sign In to Studio
                </>
              )}
            </button>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={loading}
                placeholder="Alex Doe"
                className="auth-input text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                placeholder="alex_doe"
                className="auth-input text-sm"
              />
              {username.length > 0 && !usernameValid && (
                <p className="mt-1 font-mono text-[0.65rem] text-destructive">
                  3-24 characters, starts with a letter, letters/numbers/underscores only.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com"
                className="auth-input text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Create a strong password"
                  className="auth-input pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {signupPassword.length > 0 && (
                <ul className="mt-2 space-y-1 font-mono text-[0.65rem]">
                  <li className={signupPassword.length >= 8 ? 'text-primary' : 'text-muted-foreground'}>
                    {signupPassword.length >= 8 ? (
                      <Check className="mr-1 inline h-3 w-3" />
                    ) : (
                      <X className="mr-1 inline h-3 w-3" />
                    )}
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(signupPassword) ? 'text-primary' : 'text-muted-foreground'}>
                    {/[A-Z]/.test(signupPassword) ? (
                      <Check className="mr-1 inline h-3 w-3" />
                    ) : (
                      <X className="mr-1 inline h-3 w-3" />
                    )}
                    One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(signupPassword) ? 'text-primary' : 'text-muted-foreground'}>
                    {/[a-z]/.test(signupPassword) ? (
                      <Check className="mr-1 inline h-3 w-3" />
                    ) : (
                      <X className="mr-1 inline h-3 w-3" />
                    )}
                    One lowercase letter
                  </li>
                  <li className={/[0-9]/.test(signupPassword) ? 'text-primary' : 'text-muted-foreground'}>
                    {/[0-9]/.test(signupPassword) ? (
                      <Check className="mr-1 inline h-3 w-3" />
                    ) : (
                      <X className="mr-1 inline h-3 w-3" />
                    )}
                    One number
                  </li>
                </ul>
              )}
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Repeat your password"
                  className="auth-input pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-1 font-mono text-[0.65rem] text-destructive">
                  Passwords do not match.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cta-primary mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Create Account
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-white/5 pt-4 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            {mode === 'signin' ? (
              <>
                Need an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="text-primary hover:underline font-bold"
                >
                  Register here
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                  className="text-primary hover:underline font-bold"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
