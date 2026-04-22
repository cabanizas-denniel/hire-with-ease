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
function IdentitySubmissionModal({ isOpen, userId, onClose, onSuccess }) {
  const { submitIdentity } = useVerification();
  const [idFile, setIdFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [error, setError] = useState('');

  const canSubmit = Boolean(idFile?.dataUrl && selfieFile?.dataUrl);

  const handleSubmit = () => {
    if (!canSubmit) {
      setError('Please upload both your government ID and a selfie.');
      return;
    }
    submitIdentity(userId, {
      idImage: idFile.dataUrl,
      selfieImage: selfieFile.dataUrl,
    });
    if (onSuccess) onSuccess();
    onClose();
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
        disabled={!canSubmit}
        className="w-full cursor-pointer rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Submit for review
      </button>
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Identity Verification"
      subtitle="Stage 2 of 4 — a PESO officer will compare your ID with your selfie."
      footer={footer}
      size="lg"
    >
      <div className="space-y-5">
        <div className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Accepted IDs: UMID, Driver's License, Passport, PhilHealth, Postal ID,
          SSS, Voter's ID, PRC, TESDA. Keep text readable — glare or blur will
          be rejected.
        </div>

        <FileDropInput
          label="Government ID (front-facing)"
          value={idFile}
          onChange={setIdFile}
          accept={['image/*', '.pdf']}
          hint="JPG, PNG, or PDF · up to 2 MB"
          icon={HiOutlineIdentification}
        />

        <FileDropInput
          label="Selfie holding your ID"
          value={selfieFile}
          onChange={setSelfieFile}
          accept={['image/*']}
          hint="JPG or PNG · face and ID visible · up to 2 MB"
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
