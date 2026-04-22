/**
 * Prototype mapping: auth state -> verification record id.
 *
 * In a real backend the logged-in user would already carry their own id.
 * For the demo we pin each role to a representative seed profile so the
 * Verification Center has something meaningful to render out of the box.
 * TODO: replace with real user ids once accounts are backend-backed.
 */
export function getCurrentUserId(auth) {
  if (!auth?.isAuthenticated) return null;
  if (auth.role === 'applicant') return 'wrk-201';
  if (auth.role === 'employer') return 'clt-001';
  return null;
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

export function validateUpload(file, { accept = [] } = {}) {
  if (!file) return 'Please choose a file.';
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'File is too large. Keep it under 2 MB for the prototype.';
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
