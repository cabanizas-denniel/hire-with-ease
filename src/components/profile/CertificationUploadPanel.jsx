import { useRef } from 'react';
import { HiOutlineArrowUpTray, HiOutlineTrash } from 'react-icons/hi2';

const MAX_CERT_MB = 4;

function isImageDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:image');
}

function isPdfDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:application/pdf');
}

/**
 * Optional certification uploads for worker profile (image or PDF).
 */
function CertificationUploadPanel({ certifications = [], onAddFiles, onRemoveAt, busy = false }) {
  const inputRef = useRef(null);

  const openPicker = () => {
    if (busy) return;
    inputRef.current?.click();
  };

  const count = certifications.length;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="sr-only"
        aria-hidden="true"
        onChange={(e) => {
          onAddFiles?.(e);
          e.target.value = '';
        }}
      />

      {count === 0 ? (
        <button
          type="button"
          onClick={openPicker}
          disabled={busy}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#1F4E79]/35 bg-[#1F4E79]/5 px-4 py-8 text-center transition hover:border-[#1F4E79] hover:bg-[#1F4E79]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#1F4E79]/15">
            <HiOutlineArrowUpTray className="h-7 w-7 text-[#1F4E79]" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-[#1F4E79]">Upload certification</span>
          <span className="max-w-xs text-xs text-gray-600">
            Tap to choose a photo (JPG, PNG) or PDF — TESDA, barangay clearance, etc.
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-gray-500 ring-1 ring-gray-200">
            Optional · up to {MAX_CERT_MB} MB per file
          </span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {certifications.map((cert, index) => (
              <div
                key={`${cert?.label || 'cert'}-${cert?.uploadedAt || index}`}
                className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#1F4E79]">
                      {cert?.label || 'Certification'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      {cert?.fileData
                        ? isPdfDataUrl(cert.fileData)
                          ? 'PDF document'
                          : isImageDataUrl(cert.fileData)
                            ? 'Image'
                            : 'File attached'
                        : 'No file'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveAt(index)}
                    disabled={busy}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    aria-label={`Remove ${cert?.label || 'certification'}`}
                  >
                    <HiOutlineTrash className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </div>
                {cert?.fileData && isImageDataUrl(cert.fileData) ? (
                  <img
                    src={cert.fileData}
                    alt={cert?.label || 'Certification preview'}
                    className="mt-2 max-h-36 w-full rounded-lg border border-gray-100 bg-gray-50 object-contain"
                  />
                ) : null}
                {cert?.fileData && isPdfDataUrl(cert.fileData) ? (
                  <a
                    href={cert.fileData}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-semibold text-[#2E75B6] underline"
                  >
                    Preview PDF
                  </a>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openPicker}
              disabled={busy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#1F4E79] bg-[#1F4E79]/5 px-4 py-2 text-sm font-semibold text-[#1F4E79] hover:bg-[#1F4E79]/10 disabled:opacity-60"
            >
              <HiOutlineArrowUpTray className="h-4 w-4" aria-hidden="true" />
              Add another file
            </button>
            <p className="self-center text-xs text-gray-500">
              {count} file{count === 1 ? '' : 's'} ready to save with your profile
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificationUploadPanel;
