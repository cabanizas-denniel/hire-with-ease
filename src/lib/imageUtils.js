/**
 * Browser-side image compression helper.
 *
 * We embed a job's photo directly into the Firestore /jobs document as
 * a base64 data URI so the prototype doesn't depend on Firebase
 * Storage rules. Firestore caps documents at ~1 MB, so we resize +
 * re-encode to JPEG before storing.
 *
 * Targets ~800px wide at quality 0.75 — typically lands at 80–250 KB,
 * which gives us comfortable headroom inside the doc limit while still
 * being clear enough for an applicant to gauge scope and pricing.
 */

const DEFAULT_MAX_WIDTH = 800;
const DEFAULT_MAX_HEIGHT = 800;
const DEFAULT_QUALITY = 0.75;

// 800 KB; leaves ~200 KB for the rest of the job document.
export const MAX_PHOTO_BYTES = 800 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ img, url });
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err instanceof Error ? err : new Error('Could not read the image.'));
    };
    img.src = url;
  });
}

/**
 * Resize + re-encode a File to a JPEG data URL.
 *
 * Returns:
 *   {
 *     dataUrl,
 *     width,
 *     height,
 *     bytes,           // approximate size of the encoded JPEG
 *     originalBytes,
 *     originalType,
 *   }
 */
export async function compressImageForUpload(
  file,
  {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
  } = {}
) {
  if (!file) throw new Error('Pick an image first.');
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    throw new Error('That file is not an image. JPEG, PNG, or WEBP please.');
  }

  const { img, url } = await loadImage(file);
  try {
    const ratio = Math.min(
      1,
      maxWidth / img.naturalWidth,
      maxHeight / img.naturalHeight
    );
    const width = Math.round(img.naturalWidth * ratio);
    const height = Math.round(img.naturalHeight * ratio);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    let bytes = approxBytesFromDataUrl(dataUrl);

    // If we somehow blew past the cap (huge source image), step the
    // quality down once before giving up.
    if (bytes > MAX_PHOTO_BYTES) {
      dataUrl = canvas.toDataURL('image/jpeg', Math.max(0.4, quality - 0.2));
      bytes = approxBytesFromDataUrl(dataUrl);
    }

    if (bytes > MAX_PHOTO_BYTES) {
      throw new Error(
        'This photo is still too large after compression. Try a smaller image.'
      );
    }

    return {
      dataUrl,
      width,
      height,
      bytes,
      originalBytes: file.size,
      originalType: file.type,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Best-effort byte-count for a data URL, ignoring the small ASCII
 * header. base64 length * 3/4 is a tight upper bound on payload bytes.
 */
function approxBytesFromDataUrl(dataUrl) {
  const comma = dataUrl.indexOf(',');
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.ceil((base64.length * 3) / 4);
}
