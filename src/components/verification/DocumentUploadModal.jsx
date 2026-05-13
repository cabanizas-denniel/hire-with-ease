import { useState } from 'react';
import { HiOutlineDocumentText } from 'react-icons/hi2';
import { useVerification } from '../../context/VerificationContext.jsx';
import FileDropInput from './FileDropInput.jsx';
import ModalShell from './ModalShell.jsx';

/**
 * Stage 3 — Supporting document upload.
 * Adds a single document record to the verification record. Multiple
 * calls stack documents on the user. Admins review each entry individually.
 */
const DOC_TYPES = [
  { type: 'barangay-clearance', label: 'Barangay Clearance' },
  { type: 'tesda-certificate', label: 'TESDA Certificate' },
  { type: 'police-clearance', label: 'Police / NBI Clearance' },
  { type: 'drivers-license', label: "Driver's License" },
  { type: 'sss-id', label: 'SSS ID' },
  { type: 'prc-license', label: 'PRC License' },
  { type: 'dti-permit', label: 'DTI / Business Permit' },
  { type: 'other', label: 'Other supporting document' },
];

function DocumentUploadModal({ isOpen, userId, onClose, onSuccess }) {
  const { addDocument } = useVerification();
  const [docType, setDocType] = useState(DOC_TYPES[0].type);
  const [customLabel, setCustomLabel] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const typeMeta = DOC_TYPES.find((d) => d.type === docType) || DOC_TYPES[0];
  const resolvedLabel =
    docType === 'other' ? customLabel.trim() || 'Supporting Document' : typeMeta.label;

  const canSubmit = Boolean(file?.file) && (docType !== 'other' || customLabel.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError(
        docType === 'other'
          ? 'Please name the document and upload a file.'
          : 'Please upload a file.'
      );
      return;
    }
    if (!userId) {
      setError('You must be signed in to upload documents.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await addDocument(userId, {
        type: docType,
        label: resolvedLabel,
        file: file.file || null,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not upload that document. Please try again.');
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
        {busy ? 'Uploading…' : 'Upload document'}
      </button>
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Supporting Document"
      subtitle="Stage 3 of 4 — the more documents you add, the stronger your trust score."
      footer={footer}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            Document type
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
          >
            {DOC_TYPES.map((d) => (
              <option key={d.type} value={d.type}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {docType === 'other' ? (
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Document name
            </label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g. Proof of Work"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
            />
          </div>
        ) : null}

        <FileDropInput
          label="File"
          value={file}
          onChange={setFile}
          accept={['image/*']}
          maxBytes={2 * 1024 * 1024}
          hint="JPG or PNG · up to 2 MB"
          icon={HiOutlineDocumentText}
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

export default DocumentUploadModal;
