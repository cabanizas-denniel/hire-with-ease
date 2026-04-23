import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import PasswordInput from '../../components/PasswordInput.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const LOGIN_BENEFITS = [
  'Pushed matches — no endless scrolling for jobs or workers.',
  'Trust tiers and ratings are visible before you accept or hire.',
  'One active job at a time keeps every booking accountable.',
];

function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'applicant',
  });
  const [error, setError] = useState('');
  const { login, getDefaultRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.email || !form.password || !form.role) {
      setError('Please complete all fields.');
      return;
    }

    login({ role: form.role, email: form.email });

    const fromPath = location.state?.from?.pathname;
    navigate(fromPath || getDefaultRoute(form.role), { replace: true });
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

        <div>
          <label
            htmlFor="login-role"
            className="mb-1.5 block text-xs font-semibold text-gray-700"
          >
            Sign in as
          </label>
          <select
            id="login-role"
            value={form.role}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, role: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
          >
            <option value="applicant">Worker (Service Provider)</option>
            <option value="employer">Client (Homeowner)</option>
            <option value="admin">Admin / LGU-PESO Officer</option>
          </select>
        </div>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-[#1F4E79] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 cursor-pointer"
        >
          Sign in
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
