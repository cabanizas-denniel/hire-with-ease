import { useEffect, useState } from 'react';
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
  if (code === 'auth/too-many-requests') return 'Too many attempts. Try again in a moment.';
  if (code === 'auth/network-request-failed') return 'Network error. Check your connection.';
  return err?.message || 'Sign in failed. Please try again.';
}

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, getDefaultRoute, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
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
      setError(translateAuthError(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Hire With Ease account."
      tagline="Book skilled workers like you book a ride."
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

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-lg bg-[#2E75B6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
