import { useState } from 'react';
import { HiOutlineFaceSmile, HiOutlineIdentification } from 'react-icons/hi2';
import { useVerification } from '../../context/VerificationContext.jsx';
import FileDropInput from './FileDropInput.jsx';
import ModalShell from './ModalShell.jsx';

/**
 * Stage 2 — Identity submission.
 *
 * The applicant uploads a government-issued ID and a selfie. Both are
 * stored as base64 data URIs on the verification record so the admin
 * queue can render them for review without a backend.
 */
function IdentitySubmissionModal({
  isOpen,
  userId,
  onClose,
  onSuccess,
  previousSubmissionRejected = false,
  rejectionNote = '',
}) {
  const { submitIdentity } = useVerification();
  const [idFile, setIdFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = Boolean(idFile?.file && idBackFile?.file && selfieFile?.file);

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Please upload your government ID (front + back) and a selfie.');
      return;
    }
    if (!userId) {
      setError('You must be signed in to submit identity verification.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await submitIdentity(userId, {
        idFile: idFile.file || null,
        idBackFile: idBackFile.file || null,
        selfieFile: selfieFile.file || null,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not submit identity verification. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const footer = (
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
        onClick={handleSubmit}
        disabled={!canSubmit || busy}
        className="w-full cursor-pointer rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy
          ? 'Submitting…'
          : previousSubmissionRejected
            ? 'Resubmit for review'
            : 'Submit for review'}
      </button>
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Identity Verification"
      subtitle={
        previousSubmissionRejected
          ? 'Upload new ID (front + back) and selfie — your last photos were not accepted.'
          : 'Stage 2 of 4 — a PESO officer will compare your ID with your selfie.'
      }
      footer={footer}
      size="lg"
    >
      <div className="space-y-5">
        {previousSubmissionRejected ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
            <p className="font-semibold">Previous photos were rejected</p>
            <p className="mt-1 text-red-800">
              Replace all three images below.{' '}
              {rejectionNote.trim()
                ? `PESO feedback: ${rejectionNote.trim()}`
                : 'Use sharper, well-lit pictures with readable text.'}
            </p>
          </div>
        ) : null}
        <div className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Accepted IDs: UMID, Driver's License, Passport, PhilHealth, Postal ID,
          SSS, Voter's ID, PRC, TESDA. Keep text readable — glare or blur will
          be rejected.
        </div>

        <FileDropInput
          label="Government ID (front-facing)"
          value={idFile}
          onChange={setIdFile}
          accept={['image/*']}
          maxBytes={2 * 1024 * 1024}
          hint="JPG or PNG · up to 2 MB"
          icon={HiOutlineIdentification}
        />

        <FileDropInput
          label="Government ID (back-facing)"
          value={idBackFile}
          onChange={setIdBackFile}
          accept={['image/*']}
          maxBytes={2 * 1024 * 1024}
          hint="JPG or PNG · up to 2 MB"
          icon={HiOutlineIdentification}
        />

        <FileDropInput
          label="Selfie holding your ID"
          value={selfieFile}
          onChange={setSelfieFile}
          accept={['image/*']}
          maxBytes={2 * 1024 * 1024}
          hint="JPG or PNG · up to 2 MB"
          icon={HiOutlineFaceSmile}
        />

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </ModalShell>
  );
}

export default IdentitySubmissionModal;
