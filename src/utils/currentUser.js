/**
 * Resolves the id used by client-side prototype features (e.g. the
 * Verification Center, which persists submissions to localStorage
 * keyed by user id).
 *
 * Production-shaped data uses Firebase auth UIDs, so we prefer those.
 * Anonymous / not-yet-authenticated callers get null.
 */
export function getCurrentUserId(auth) {
  if (!auth?.isAuthenticated) return null;
  return auth?.user?.uid || null;
}

export function getCurrentUserRole(auth) {
  if (auth?.role === 'applicant') return 'service-provider';
  if (auth?.role === 'employer') return 'client';
  return null;
}

/**
 * Reads a File into a base64 data URI. Used by the verification upload
 * modals (ID, selfie, supporting documents) while the prototype persists
 * to localStorage. TODO: swap for real multipart upload in production.
 */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

/** Soft cap so base64 payloads don't blow up localStorage. */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

export function validateUpload(file, { accept = [], maxBytes = MAX_UPLOAD_BYTES } = {}) {
  if (!file) return 'Please choose a file.';
  if (typeof maxBytes === 'number' && maxBytes > 0 && file.size > maxBytes) {
    const mb = Math.max(0.1, Math.round((maxBytes / 1024 / 1024) * 10) / 10);
    return `File is too large. Keep it under ${mb} MB.`;
  }
  if (accept.length) {
    const okType = accept.some((a) =>
      a.startsWith('.')
        ? file.name.toLowerCase().endsWith(a.toLowerCase())
        : file.type === a || file.type.startsWith(a.replace('/*', '/'))
    );
    if (!okType) return 'Unsupported file type.';
  }
  return null;
}
