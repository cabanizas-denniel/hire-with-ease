import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';

function RegisterPage() {
  const location = useLocation();
  const defaultRole = location.state?.defaultRole === 'employer' ? 'employer' : 'applicant';

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
    <div className="min-h-screen bg-gray-50">
      <Navbar links={[]} />
      <div className="mx-auto flex max-w-md px-4 py-10 sm:px-6">
        <form onSubmit={handleSubmit} className="w-full rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-2xl font-semibold text-[#1F4E79]">Register</h1>
          <p className="mt-1 text-sm text-gray-600">Create an account to get started.</p>

          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Full name"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Password"
              required
            />
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Confirm password"
              required
            />
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="applicant">Worker (I provide services)</option>
              <option value="employer">Client (I need work done)</option>
            </select>
          </div>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <button type="submit" className="mt-5 w-full rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white">
            Register
          </button>

          <p className="mt-4 text-sm text-gray-600">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-[#2E75B6]">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
