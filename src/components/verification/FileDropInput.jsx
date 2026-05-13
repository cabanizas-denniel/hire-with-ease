import { useEffect, useRef, useState } from 'react';
import { HiOutlineArrowUpTray, HiOutlineDocumentText, HiOutlinePhoto, HiOutlineXMark } from 'react-icons/hi2';
import { MAX_UPLOAD_BYTES, validateUpload } from '../../utils/currentUser.js';

/**
 * Reusable file picker for verification uploads.
 *
 * Important: base64 conversion is intentionally avoided by default because it
 * makes uploads feel slow (read + upload). We emit the raw File and a local
 * object URL for preview instead.
 */
function FileDropInput({
  label,
  value,
  onChange,
  accept = ['image/*', '.pdf'],
  maxBytes,
  hint,
  icon,
}) {
  const Icon = icon || HiOutlinePhoto;
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (value?.previewUrl) {
        try {
          URL.revokeObjectURL(value.previewUrl);
        } catch {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = (file) => {
    const validationError = validateUpload(file, { accept, maxBytes });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    const previewUrl = URL.createObjectURL(file);
    if (value?.previewUrl) {
      try {
        URL.revokeObjectURL(value.previewUrl);
      } catch {
        // ignore
      }
    }
    onChange({ file, previewUrl, name: file.name, type: file.type, size: file.size });
  };

  const handleClear = () => {
    if (value?.previewUrl) {
      try {
        URL.revokeObjectURL(value.previewUrl);
      } catch {
        // ignore
      }
    }
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const preview = value?.previewUrl || null;
  const isImage = Boolean(preview && value?.type?.startsWith('image/'));

  return (
    <div>
      {label ? (
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">
          {label}
        </label>
      ) : null}

      {preview ? (
        <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {isImage ? (
            <img
              src={preview}
              alt={value.name || 'Uploaded preview'}
              className="mx-auto max-h-56 w-full object-contain"
            />
          ) : (
            <div className="flex items-center gap-2 p-3 text-sm text-gray-700">
              <HiOutlineDocumentText className="h-5 w-5 text-gray-400" aria-hidden="true" />
              <span className="truncate">{value.name || 'Uploaded file'}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-gray-500 shadow hover:text-red-600 cursor-pointer"
            aria-label="Remove file"
          >
            <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center hover:border-[#1F4E79] hover:bg-blue-50/40"
        >
          <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
          <span className="text-sm font-medium text-gray-700">
            <span className="text-[#1F4E79] underline">Click to upload</span>
          </span>
          {hint ? (
            <span className="text-[11px] text-gray-500">{hint}</span>
          ) : (
            <span className="text-[11px] text-gray-500">
              Up to {Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB · images or PDF
            </span>
          )}
          <HiOutlineArrowUpTray className="sr-only" aria-hidden="true" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept.join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export default FileDropInput;
