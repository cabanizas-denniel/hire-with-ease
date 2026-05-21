import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import PasswordInput from '../../components/PasswordInput.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const LOGIN_BENEFITS = [
  'Pushed matches — no endless scrolling for jobs or workers.',
  'Trust tiers and ratings are visible before you accept or hire.',
  'One active job at a time keeps every booking accountable.',
];

function translateAuthError(err) {
  const code = err?.code || '';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Email or password is incorrect.';
  }
  if (code === 'auth/invalid-email') return 'That email address looks invalid.';
  if (code === 'auth/missing-email') return 'Please enter your email address.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Try again in a moment.';
  if (code === 'auth/email-not-verified') return 'Please verify your email first.';
  if (code === 'auth/already-verified') return 'Email is already verified. You can sign in now.';
  if (code === 'auth/network-request-failed') return 'Network error. Check your connection.';
  return err?.message || 'Sign in failed. Please try again.';
}

const RESEND_COOLDOWN_MS = 10 * 60 * 1000;

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendNotice, setResendNotice] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetNotice, setResetNotice] = useState('');
  const [tick, setTick] = useState(0);

  const { login, resendVerificationEmail, sendPasswordReset, getDefaultRoute, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const resendKey = useMemo(() => {
    const normalized = (form.email || '').trim().toLowerCase();
    return normalized ? `hwe:verifyResendAt:${normalized}` : '';
  }, [form.email]);

  const resendCooldownRemainingMs = useMemo(() => {
    if (!resendKey) return 0;
    const raw = window.localStorage.getItem(resendKey);
    const lastAt = raw ? Number(raw) : 0;
    if (!lastAt || Number.isNaN(lastAt)) return 0;
    const remaining = lastAt + RESEND_COOLDOWN_MS - Date.now();
    return remaining > 0 ? remaining : 0;
  }, [resendKey, tick]);

  const resendCooldownText = useMemo(() => {
    const ms = resendCooldownRemainingMs;
    if (!ms) return '';
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }, [resendCooldownRemainingMs]);

  useEffect(() => {
    if (!needsVerification) return undefined;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [needsVerification]);

  // Navigate AFTER AuthContext has actually committed the authenticated
  // state. If we navigated immediately from handleSubmit, ProtectedRoute
  // would still see isAuthenticated=false (Firebase's onAuthStateChanged
  // callback hadn't run yet) and bounce us back here, remounting the form
  // and wiping the inputs.
  useEffect(() => {
    if (!isAuthenticated || !role) return;
    const fromPath = location.state?.from?.pathname;
    navigate(fromPath || getDefaultRoute(role), { replace: true });
  }, [isAuthenticated, role, location.state, navigate, getDefaultRoute]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNeedsVerification(false);
    setResendNotice('');
    setResetNotice('');

    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    const now = Date.now();
    if (cooldownUntil && now < cooldownUntil) {
      const seconds = Math.ceil((cooldownUntil - now) / 1000);
      setError(`Too many attempts. Try again in ${seconds}s.`);
      return;
    }

    setSubmitting(true);
    try {
      const signedInRole = await login({
        email: form.email,
        password: form.password,
      });
      if (!signedInRole) {
        setError('No role assigned to this account. Please contact an administrator.');
        setSubmitting(false);
        return;
      }
      // Keep the button disabled and inputs intact while we wait for the
      // AuthProvider effect above to navigate us to the dashboard.
    } catch (err) {
      if (err?.code === 'auth/email-not-verified') {
        setNeedsVerification(true);
      }
      setError(translateAuthError(err));
      // Progressive backoff (UX + friction). This is NOT the security boundary:
      // the real boundary is Firebase Auth + Firestore Rules.
      setFailCount((prev) => {
        const next = prev + 1;
        const delayMs =
          next >= 8 ? 30_000 :
          next >= 5 ? 10_000 :
          next >= 3 ? 3_000 :
          0;
        if (delayMs) setCooldownUntil(Date.now() + delayMs);
        return next;
      });
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setError('');
    setResendNotice('');
    setNeedsVerification(true);
    setResetNotice('');

    if (!form.email || !form.password) {
      setError('Enter your email and password to resend the verification email.');
      return;
    }
    if (resendCooldownRemainingMs) return;

    setResendBusy(true);
    try {
      await resendVerificationEmail({ email: form.email, password: form.password });
      if (resendKey) window.localStorage.setItem(resendKey, String(Date.now()));
      setResendNotice('Verification email resent. Please check your inbox (and spam/junk).');
      setTick((t) => t + 1);
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setResendBusy(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setError('');
    setResendNotice('');
    setNeedsVerification(false);
    setResetNotice('');

    const email = (form.email || '').trim();
    if (!email) {
      setError('Enter your email address first, then click “Send reset link”.');
      setResetOpen(true);
      return;
    }

    setResetBusy(true);
    try {
      await sendPasswordReset({ email });
      setResetNotice('Password reset link sent. Please check your inbox (and spam/junk).');
      setResetOpen(true);
    } catch (err) {
      setError(translateAuthError(err));
      setResetOpen(true);
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Hire With Ease account."
      tagline="Sign in and get matched to the right people quickly and easily."
 
 
 
      benefits={LOGIN_BENEFITS}
      footer={
        <p className="text-sm text-gray-600">
          No account yet?{' '}
          <Link to="/register" className="font-semibold text-[#2E75B6] hover:underline">
            Create one here
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {needsVerification ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Email not verified yet</p>
            <p className="mt-1 text-amber-900/90">
              Please verify your email to activate your account. If you didn’t receive the email, you can resend it.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendBusy || !!resendCooldownRemainingMs}
                className="cursor-pointer rounded-lg bg-amber-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resendBusy
                  ? 'Resending…'
                  : resendCooldownRemainingMs
                    ? `Resend available in ${resendCooldownText}`
                    : 'Resend verification email'}
              </button>
              <span className="text-xs text-amber-900/70">Cooldown: 10 minutes</span>
            </div>
            {resendNotice ? (
              <p className="mt-2 text-xs text-amber-900/80">{resendNotice}</p>
            ) : null}
          </div>
        ) : null}

        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-xs font-semibold text-gray-700"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-1.5 block text-xs font-semibold text-gray-700"
          >
            Password
          </label>
          <PasswordInput
            id="login-password"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setResetOpen((v) => !v);
              setError('');
              setResetNotice('');
              setResendNotice('');
              setNeedsVerification(false);
            }}
            className="text-xs font-semibold text-[#2E75B6] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {resetOpen ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <p className="font-semibold">Reset your password</p>
            <p className="mt-1 text-sky-900/90">
              We’ll send a password reset link to the email address you used when registering.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={resetBusy || submitting || resendBusy}
                className="cursor-pointer rounded-lg bg-[#1F4E79] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resetBusy ? 'Sending…' : 'Send reset link'}
              </button>
              <span className="text-xs text-sky-900/70">Use the same email above.</span>
            </div>
            {resetNotice ? (
              <p className="mt-2 text-xs text-sky-900/80">{resetNotice}</p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || resendBusy}
          className="mt-2 w-full rounded-lg bg-[#2E75B6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
