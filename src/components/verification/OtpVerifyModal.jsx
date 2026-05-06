import { useEffect, useMemo, useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { HiOutlineEnvelope } from 'react-icons/hi2';
import { useVerification } from '../../context/VerificationContext.jsx';
import ModalShell from './ModalShell.jsx';
import { auth } from '../../lib/firebase.js';

/**
 * Email verification using Firebase Auth.
 *
 * Flow:
 * - Send Firebase "Verify email address" message to the currently signed-in user.
 * - User clicks the link, then returns and taps "I've verified" to refresh.
 */

function OtpVerifyModal({
  isOpen,
  userId,
  accountEmail = '',
  existingEmail,
  onClose,
  onSuccess,
}) {
  const { confirmOtp } = useVerification();
  const [step, setStep] = useState('details');
  const [error, setError] = useState('');
  const [sentAt, setSentAt] = useState(null);
  const [busy, setBusy] = useState(false);

  const firebaseUser = auth?.currentUser || null;
  const effectiveEmail = useMemo(() => {
    return (
      (firebaseUser?.email || '').trim() ||
      (existingEmail || '').trim() ||
      (accountEmail || '').trim()
    );
  }, [firebaseUser?.email, existingEmail, accountEmail]);

  useEffect(() => {
    if (!isOpen) return;
    setStep('details');
    setError('');
    setSentAt(null);
    setBusy(false);
  }, [isOpen, existingEmail, accountEmail]);

  const handleSend = async () => {
    if (!auth) {
      setError('Firebase is not configured. Email verification is unavailable.');
      return;
    }
    if (!firebaseUser) {
      setError('You need to be signed in to send a verification email.');
      return;
    }
    if (!firebaseUser.email) {
      setError('No email is set on this account.');
      return;
    }
    if (firebaseUser.emailVerified) {
      // Already verified; complete Stage 1 immediately.
      confirmOtp(userId, { email: firebaseUser.email });
      if (onSuccess) onSuccess();
      onClose();
      return;
    }
    setBusy(true);
    setError('');
    try {
      await sendEmailVerification(firebaseUser, {
        url: window.location.origin,
        handleCodeInApp: false,
      });
      setSentAt(Date.now());
      setStep('code');
    } catch (err) {
      setError(err?.message || 'Could not send verification email. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleIveVerified = async () => {
    if (!firebaseUser) {
      setError('You need to be signed in to complete verification.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await firebaseUser.reload();
      if (!firebaseUser.emailVerified) {
        setError("Still not verified yet. Check your inbox (and spam), click the link, then try again.");
        return;
      }
      confirmOtp(userId, { email: firebaseUser.email });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not refresh verification state. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const footer =
    step === 'details' ? (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={busy}
          className="w-full cursor-pointer rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Sending…' : 'Send verification email'}
        </button>
      </div>
    ) : (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStep('details')}
          className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleIveVerified}
          disabled={busy}
          className="w-full cursor-pointer rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Checking…' : "I've verified"}
        </button>
      </div>
    );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Email verification"
      subtitle={
        step === 'details'
          ? 'Stage 1 of 4 — send a verification email to your account.'
          : 'Stage 1 of 4 — click the link, then come back and confirm.'
      }
      footer={footer}
    >
      {step === 'details' ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Account email
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
              <HiOutlineEnvelope className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
              <p className="w-full min-w-0 break-all text-sm text-gray-800">
                {effectiveEmail || '—'}
              </p>
            </div>
            {!effectiveEmail ? (
              <p className="mt-1 text-[11px] text-amber-700">
                No account email found. Please sign in with an email/password account.
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}

          <p className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-800">
            We’ll send a verification email via Firebase. Open it, click the link, then return here and tap “I’ve verified”.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              Verification email sent
            </p>
            <p className="mt-1 break-all text-[11px] text-emerald-700/80">
              To {effectiveEmail || 'your email'}
              {sentAt ? ` · ${new Date(sentAt).toLocaleTimeString()}` : ''}
            </p>
          </div>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{`Didn't receive it?`}</span>
            <button
              type="button"
              onClick={handleSend}
              disabled={busy}
              className="cursor-pointer font-semibold text-[#1F4E79] hover:underline"
            >
              Resend email
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

export default OtpVerifyModal;
