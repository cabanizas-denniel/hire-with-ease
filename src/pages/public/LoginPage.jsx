import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', role: 'applicant' });
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
    <div className="min-h-screen bg-gray-50">
      <Navbar links={[{}]} />
      <div className="mx-auto flex max-w-md px-4 py-10 sm:px-6">
        <form onSubmit={handleSubmit} className="w-full rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-2xl font-semibold text-[#1F4E79]">Login</h1>
          <p className="mt-1 text-sm text-gray-600">Access your Hire With Ease dashboard.</p>

          <div className="mt-4 space-y-3">
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Email"
            />
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Password"
            />
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="applicant">Applicant</option>
              <option value="employer">Employer</option>
              <option value="admin">Admin / LGU-PESO Officer</option>
            </select>
          </div>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <button type="submit" className="mt-5 w-full rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white">
            Login
          </button>

          <p className="mt-4 text-sm text-gray-600">
            No account yet?{' '}
            <Link to="/register" className="font-medium text-[#2E75B6]">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
