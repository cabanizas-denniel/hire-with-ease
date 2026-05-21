import { compressImageForUpload, ACCEPTED_IMAGE_TYPES } from './imageUtils.js';

/** Max source file size before compression (browser read). */
export const MAX_ISSUE_MEDIA_BYTES = 10 * 1024 * 1024;

/** Firestore doc limit — keep total embedded media under ~900 KB. */
export const MAX_ISSUE_PHOTOS = 4;

export function assertIssueMediaFile(file) {
  if (!file) throw new Error('Pick a photo first.');
  if (file.size > MAX_ISSUE_MEDIA_BYTES) {
    throw new Error(`"${file.name}" is larger than 10 MB. Choose a smaller photo.`);
  }
  const t = file.type || '';
  if (!t.startsWith('image/') && !ACCEPTED_IMAGE_TYPES.includes(t)) {
    throw new Error(`"${file.name}" must be a photo (JPEG, PNG, or WEBP). Videos are not supported.`);
  }
}

/**
 * Compress and embed issue photos on the job document (no Firebase Storage).
 * Returns media entries with data-URL `url` fields readable by JobIssueMedia.
 */
export async function prepareJobIssueMedia(_jobId, files, { onProgress } = {}) {
  const list = files || [];
  if (list.length > MAX_ISSUE_PHOTOS) {
    throw new Error(`Add at most ${MAX_ISSUE_PHOTOS} photos per request.`);
  }

  const results = [];
  let totalBytes = 0;
  const maxTotalBytes = 900 * 1024;

  for (let i = 0; i < list.length; i++) {
    const file = list[i];
    assertIssueMediaFile(file);
    onProgress?.({ index: i, total: list.length });

    const compressed = await compressImageForUpload(file);
    if (totalBytes + compressed.bytes > maxTotalBytes) {
      throw new Error(
        'These photos are too large to save together (Firestore limit). Remove one or use smaller images.'
      );
    }
    totalBytes += compressed.bytes;

    results.push({
      url: compressed.dataUrl,
      contentType: 'image/jpeg',
      originalName: file.name,
      bytes: compressed.bytes,
      uploadedAt: new Date().toISOString(),
      inline: true,
    });
  }

  return results;
}
