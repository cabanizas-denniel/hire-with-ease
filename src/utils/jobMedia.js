/**
 * Normalize job issue attachments: new jobs use `media` (Storage URLs);
 * older seeded jobs may still use inline `photo.dataUrl`.
 */
export function getJobMediaEntries(job) {
  if (!job) return [];
  if (Array.isArray(job.media) && job.media.length > 0) {
    return job.media.map((m) => ({
      url: m.url,
      contentType: m.contentType || '',
      originalName: m.originalName || null,
    }));
  }
  if (job.photo?.dataUrl) {
    return [
      {
        url: job.photo.dataUrl,
        contentType: 'image/jpeg',
        originalName: job.photo.originalName || null,
      },
    ];
  }
  return [];
}

export function isVideoMediaEntry(entry) {
  return (entry.contentType || '').startsWith('video/');
}
