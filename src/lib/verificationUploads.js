import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

function withTimeout(promise, ms, { onTimeout } = {}) {
  if (!ms || ms <= 0) return promise;
  let timeoutId = null;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      try {
        onTimeout?.();
      } catch {
        // ignore
      }
      reject(
        new Error(
          'Upload timed out. Check your internet connection and Firebase Storage rules, then try again.'
        )
      );
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

function safeFileSegment(name) {
  const base = (name || 'file').split(/[/\\]/).pop();
  const cleaned = base.replace(/[^\w.\-]+/g, '_').slice(0, 120);
  return cleaned || 'file';
}

export function isPdfLike({ contentType, url, dataUrl } = {}) {
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('pdf')) return true;
  const src = url || dataUrl || '';
  if (typeof src !== 'string') return false;
  if (src.startsWith('data:application/pdf')) return true;
  try {
    const lower = src.toLowerCase();
    if (lower.startsWith('http') && lower.includes('.pdf')) return true;
  } catch {
    // ignore
  }
  return false;
}

/**
 * Upload a verification file to Firebase Storage and return metadata.
 * Falls back to returning null when storage is unavailable.
 */
export async function uploadVerificationFile(
  storage,
  userId,
  file,
  { kind = 'misc', onProgress } = {}
) {
  if (!storage || !userId || !file) return null;

  const ts = Date.now();
  const safeKind = String(kind || 'misc').replace(/[^\w.\-]+/g, '_').slice(0, 40) || 'misc';
  const path = `verification-uploads/${userId}/${safeKind}/${ts}-${safeFileSegment(file.name)}`;
  const storageRef = ref(storage, path);

  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type || 'application/octet-stream',
  });

  await withTimeout(
    new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        (snap) => {
          if (typeof onProgress !== 'function') return;
          const total = snap.totalBytes || file.size || 0;
          const transferred = snap.bytesTransferred || 0;
          const percent = total ? Math.round((transferred / total) * 100) : null;
          try {
            onProgress({ bytesTransferred: transferred, totalBytes: total, percent });
          } catch {
            // ignore progress handler errors
          }
        },
        (err) => reject(err),
        () => resolve()
      );
    }),
    90_000,
    {
      onTimeout: () => {
        try {
          task.cancel();
        } catch {
          // ignore
        }
      },
    }
  );

  const url = await getDownloadURL(task.snapshot.ref);
  return {
    url,
    contentType: file.type || '',
    originalName: file.name || '',
    bytes: file.size ?? null,
    uploadedAt: new Date().toISOString(),
  };
}

