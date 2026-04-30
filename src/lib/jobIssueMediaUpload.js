import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

/** Per-file limit for images and videos on the request form. */
export const MAX_ISSUE_MEDIA_BYTES = 25 * 1024 * 1024;

export function assertIssueMediaFile(file) {
  if (!file) throw new Error('Pick a file first.');
  if (file.size > MAX_ISSUE_MEDIA_BYTES) {
    throw new Error(`"${file.name}" is larger than 25 MB. Choose a smaller file.`);
  }
  const t = file.type || '';
  if (!t.startsWith('image/') && !t.startsWith('video/')) {
    throw new Error(`"${file.name}" must be an image or a video.`);
  }
}

function safeFileSegment(name) {
  const base = (name || 'file').split(/[/\\]/).pop();
  const cleaned = base.replace(/[^\w.\-]+/g, '_').slice(0, 120);
  return cleaned || 'file';
}

/**
 * Upload issue photos/videos to Firebase Storage (requires bucket + rules allowing writes).
 * Returns compact records stored on the job document.
 */
export async function uploadJobIssueFiles(storage, jobId, files) {
  if (!storage) {
    throw new Error(
      'File uploads need Firebase Storage. Set VITE_FIREBASE_STORAGE_BUCKET in .env and configure Storage rules.'
    );
  }
  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    assertIssueMediaFile(file);
    const path = `job-issue-media/${jobId}/${i}-${safeFileSegment(file.name)}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, {
      contentType: file.type || 'application/octet-stream',
    });
    const url = await getDownloadURL(storageRef);
    results.push({
      url,
      contentType: file.type || '',
      originalName: file.name,
      bytes: file.size,
      uploadedAt: new Date().toISOString(),
    });
  }
  return results;
}
