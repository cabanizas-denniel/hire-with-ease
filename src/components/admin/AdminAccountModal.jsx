import { useEffect, useState } from 'react';
import PasswordInput from '../PasswordInput.jsx';
import ModalShell from '../verification/ModalShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPasswordStrength } from '../../lib/passwordStrength.js';

function translateChangePasswordError(err) {
  const code = err?.code || '';
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Current password is incorrect.';
  }
  if (code === 'auth/weak-password') {
    return 'New password is too weak. Use at least 6 characters.';
  }
  if (code === 'auth/requires-recent-login') {
    return 'Please sign out and sign in again, then try changing your password.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Wait a moment and try again.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network error. Check your connection.';
  }
  return err?.message || 'Could not update password. Please try again.';
}

function AdminAccountModal({ isOpen, onClose }) {
  const { user, role, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const strength = getPasswordStrength(newPassword);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setBusy(false);
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setBusy(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(translateChangePasswordError(err));
    } finally {
      setBusy(false);
    }
  };

  const roleLabel = role === 'admin' ? 'Admin' : role || 'Unknown';

  return (
    <ModalShell
      isOpen={isOpen}
      title="Account"
      subtitle={user?.email ? `${user.fullName || 'PESO Admin'} · ${user.email}` : 'Manage your admin account'}
      onClose={busy ? undefined : onClose}
      size="lg"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-[#1F4E79]">Change password</h3>
          <p className="mt-1 text-xs text-gray-500">
            Your current password is required before setting a new one.
          </p>

          <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="admin-current-password" className="mb-1 block text-xs font-medium text-gray-600">
                Current password
              </label>
              <PasswordInput
                id="admin-current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div>
              <label htmlFor="admin-new-password" className="mb-1 block text-xs font-medium text-gray-600">
                New password
              </label>
              <PasswordInput
                id="admin-new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              {newPassword ? (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all ${strength.barClass}`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Strength: <span className="font-medium text-gray-700">{strength.label}</span>
                  </p>
                </div>
              ) : null}
            </div>

            <div>
              <label htmlFor="admin-confirm-password" className="mb-1 block text-xs font-medium text-gray-600">
                Confirm new password
              </label>
              <PasswordInput
                id="admin-confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-[#1F4E79] px-4 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60 cursor-pointer"
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </ModalShell>
  );
}

export default AdminAccountModal;
