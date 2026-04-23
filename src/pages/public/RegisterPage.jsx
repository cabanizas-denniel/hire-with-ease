import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import PasswordInput from '../../components/PasswordInput.jsx';

const REGISTER_BENEFITS = [
  'Free to sign up — set your role and start in under a minute.',
  'Workers: availability-first profile means no wasted applications.',
  'Clients: one focused request at a time, workers come to you.',
];

function RegisterPage() {
  const location = useLocation();
  const defaultRole =
    location.state?.defaultRole === 'employer' ? 'employer' : 'applicant';

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    navigate('/login');
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Tell us who you are — we'll tailor the experience to your role."
      tagline="Join the platform that pushes work to the right people."
      benefits={REGISTER_BENEFITS}
      footer={
        <p className="text-sm text-gray-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#2E75B6] hover:underline">
            Sign in here
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label
            htmlFor="reg-name"
            className="mb-1.5 block text-xs font-semibold text-gray-700"
          >
            Full name
          </label>
          <input
            id="reg-name"
            type="text"
            value={form.fullName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fullName: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
            placeholder="Juan Dela Cruz"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label
            htmlFor="reg-email"
            className="mb-1.5 block text-xs font-semibold text-gray-700"
          >
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="reg-password"
              className="mb-1.5 block text-xs font-semibold text-gray-700"
            >
              Password
            </label>
            <PasswordInput
              id="reg-password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label
              htmlFor="reg-confirm"
              className="mb-1.5 block text-xs font-semibold text-gray-700"
            >
              Confirm password
            </label>
            <PasswordInput
              id="reg-confirm"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Re-enter password"
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
            I am joining as
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <RoleOption
              active={form.role === 'applicant'}
              onClick={() =>
                setForm((prev) => ({ ...prev, role: 'applicant' }))
              }
              title="Worker"
              subtitle="I provide services"
            />
            <RoleOption
              active={form.role === 'employer'}
              onClick={() =>
                setForm((prev) => ({ ...prev, role: 'employer' }))
              }
              title="Client"
              subtitle="I need work done"
            />
          </div>
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
          Create account
        </button>
      </form>
    </AuthLayout>
  );
}

function RoleOption({ active, onClick, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-start rounded-lg border px-3.5 py-2.5 text-left transition cursor-pointer ${
        active
          ? 'border-[#1F4E79] bg-[#1F4E79] text-white shadow-sm'
          : 'border-gray-200 bg-white text-gray-700 hover:border-[#1F4E79]/40 hover:bg-[#1F4E79]/5'
      }`}
    >
      <span className="text-sm font-semibold">{title}</span>
      <span className={`text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>
        {subtitle}
      </span>
    </button>
  );
}

export default RegisterPage;
