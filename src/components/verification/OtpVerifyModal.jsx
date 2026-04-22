import { useState } from 'react';
import { HiOutlineDevicePhoneMobile, HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';
import { useVerification } from '../../context/VerificationContext.jsx';
import ModalShell from './ModalShell.jsx';

/**
 * Simulated OTP flow for the prototype.
 *
 * Step 1 — "details": user enters mobile + (optional) email
 * Step 2 — "code": we generate a 6-digit code locally and show it on screen
 *                 so reviewers can "receive" it in the demo. Matching the
 *                 code confirms OTP and advances the verification record.
 *
 * TODO: replace local code generation with a real SMS provider once the
 * backend is wired.
 */
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function OtpVerifyModal({ isOpen, userId, existingMobile, existingEmail, onClose, onSuccess }) {
  const { confirmOtp } = useVerification();
  const [step, setStep] = useState('details');
  const [mobile, setMobile] = useState(existingMobile || '');
  const [email, setEmail] = useState(existingEmail || '');
  const [otp, setOtp] = useState('');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [sentAt, setSentAt] = useState(null);

  const mobileValid = /^\+?[\d\s-]{10,}$/.test(mobile.trim());

  const handleSend = () => {
    if (!mobileValid) {
      setError('Enter a valid mobile number (at least 10 digits).');
      return;
    }
    setError('');
    const code = generateOtp();
    setOtp(code);
    setSentAt(Date.now());
    setStep('code');
  };

  const handleResend = () => {
    const code = generateOtp();
    setOtp(code);
    setSentAt(Date.now());
    setInput('');
    setError('');
  };

  const handleVerify = () => {
    if (input.trim() !== otp) {
      setError("That code doesn't match. Double-check and try again.");
      return;
    }
    confirmOtp(userId, { mobile: mobile.trim(), email: email.trim() || null });
    if (onSuccess) onSuccess();
    onClose();
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
          className="w-full cursor-pointer rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110"
        >
          Send OTP
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
          onClick={handleVerify}
          disabled={input.length !== 6}
          className="w-full cursor-pointer rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Verify
        </button>
      </div>
    );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Phone Verification"
      subtitle={
        step === 'details'
          ? 'Stage 1 of 4 — confirm your number to start receiving job alerts.'
          : 'Stage 1 of 4 — enter the 6-digit code we sent.'
      }
      footer={footer}
    >
      {step === 'details' ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Mobile number
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-[#1F4E79] focus-within:ring-1 focus-within:ring-[#1F4E79]">
              <HiOutlineDevicePhoneMobile className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <input
                type="tel"
                inputMode="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+63 9XX XXX XXXX"
                className="w-full bg-transparent text-sm text-gray-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Email <span className="text-gray-400">(optional)</span>
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-[#1F4E79] focus-within:ring-1 focus-within:ring-[#1F4E79]">
              <HiOutlineEnvelope className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm text-gray-800 outline-none"
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}

          <p className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-800">
            We'll send a 6-digit code to this number. For the prototype, the
            code will appear on the next screen instead of an actual SMS.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              Demo OTP (this screen only)
            </p>
            <p className="mt-1 text-3xl font-bold tracking-[0.35em] text-emerald-800">
              {otp}
            </p>
            <p className="mt-1 text-[11px] text-emerald-700/80">
              Sent to {mobile || 'your number'}
              {sentAt ? ` · ${new Date(sentAt).toLocaleTimeString()}` : ''}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Enter the 6-digit code
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-[#1F4E79] focus-within:ring-1 focus-within:ring-[#1F4E79]">
              <HiOutlineLockClosed className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="------"
                className="w-full bg-transparent text-center text-lg font-semibold tracking-[0.35em] text-gray-800 outline-none"
                autoFocus
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Didn't get it?</span>
            <button
              type="button"
              onClick={handleResend}
              className="cursor-pointer font-semibold text-[#1F4E79] hover:underline"
            >
              Resend code
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

export default OtpVerifyModal;
