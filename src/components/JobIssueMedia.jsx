import { getJobMediaEntries, isVideoMediaEntry } from '../utils/jobMedia.js';

/**
 * Renders job issue photos/videos. Use `variant="card"` for JobCard (first item only).
 */
function JobIssueMedia({
  job,
  variant = 'gallery',
  compact = false,
  titleAlt = 'Issue media',
}) {
  const entries = getJobMediaEntries(job);
  if (!entries.length) return null;

  const list = variant === 'card' ? entries.slice(0, 1) : entries;

  const itemClass =
    variant === 'card'
      ? `w-full object-cover ${compact ? 'max-h-32' : 'max-h-56'}`
      : 'max-h-72 w-full object-contain bg-white';

  return (
    <div className={variant === 'card' ? 'bg-gray-100' : 'space-y-2 bg-gray-100'}>
      {list.map((entry, i) => (
        <div key={`${entry.url}-${i}`} className={variant === 'gallery' && i > 0 ? 'border-t border-gray-200 pt-2' : ''}>
          {isVideoMediaEntry(entry) ? (
            <video
              src={entry.url}
              controls
              playsInline
              className={itemClass}
              aria-label={`${titleAlt} ${i + 1}`}
            />
          ) : (
            <img
              src={entry.url}
              alt={`${titleAlt} ${i + 1}`}
              className={variant === 'card' ? itemClass : `${itemClass} object-contain`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default JobIssueMedia;
