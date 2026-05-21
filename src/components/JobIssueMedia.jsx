import { useState } from 'react';
import { getJobMediaEntries, isVideoMediaEntry } from '../utils/jobMedia.js';
import JobMediaLightbox from './JobMediaLightbox.jsx';

/**
 * Renders job issue photos/videos. Use `variant="card"` for JobCard (first item only).
 * Set `expandable` so workers/homeowners can tap photos for a full-screen view.
 */
function JobIssueMedia({
  job,
  variant = 'gallery',
  compact = false,
  titleAlt = 'Issue media',
  expandable = true,
}) {
  const entries = getJobMediaEntries(job);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!entries.length) return null;

  const list = variant === 'card' ? entries.slice(0, 1) : entries;
  const extraCount = variant === 'card' && entries.length > 1 ? entries.length - 1 : 0;

  const itemClass =
    variant === 'card'
      ? `w-full object-cover ${compact ? 'max-h-32' : 'max-h-56'}`
      : 'max-h-72 w-full object-contain bg-white';

  const openLightbox = (indexInFullList) => {
    if (!expandable) return;
    setLightboxIndex(indexInFullList);
  };

  return (
    <>
      <div className={variant === 'card' ? 'relative bg-gray-100' : 'space-y-2 bg-gray-100'}>
        {list.map((entry, i) => {
          const canExpand = expandable;

          return (
            <div
              key={`${entry.url}-${i}`}
              className={
                variant === 'gallery' && i > 0 ? 'border-t border-gray-200 pt-2' : ''
              }
            >
              {isVideoMediaEntry(entry) ? (
                <video
                  src={entry.url}
                  controls
                  playsInline
                  className={itemClass}
                  aria-label={`${titleAlt} ${i + 1}`}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => openLightbox(i)}
                  disabled={!canExpand}
                  className={`block w-full text-left ${canExpand ? 'cursor-pointer group' : 'cursor-default'}`}
                  aria-label={canExpand ? `View larger: ${titleAlt} ${i + 1}` : undefined}
                >
                  <img
                    src={entry.url}
                    alt={`${titleAlt} ${i + 1}`}
                    className={`${variant === 'card' ? itemClass : `${itemClass} object-contain`} ${
                      canExpand ? 'transition group-hover:brightness-95' : ''
                    }`}
                  />
                  {canExpand && variant === 'card' ? (
                    <span className="pointer-events-none absolute bottom-2 right-2 rounded-md">
                    </span>
                  ) : null}
                </button>
              )}
            </div>
          );
        })}
        {extraCount > 0 ? (
          <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
            +{extraCount} more
          </span>
        ) : null}
      </div>

      {lightboxIndex !== null ? (
        <JobMediaLightbox
          items={entries}
          startIndex={lightboxIndex}
          titleAlt={titleAlt}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}

export default JobIssueMedia;