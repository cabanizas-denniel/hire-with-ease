import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineXMark } from 'react-icons/hi2';
import { isVideoMediaEntry } from '../utils/jobMedia.js';

/**
 * Full-screen viewer for job issue photos (and videos).
 */
function JobMediaLightbox({ items, startIndex = 0, titleAlt = 'Issue photo', onClose }) {
  const list = items || [];
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(0, startIndex), Math.max(0, list.length - 1)),
  );

  useEffect(() => {
    setIndex(Math.min(Math.max(0, startIndex), Math.max(0, list.length - 1)));
  }, [startIndex, list.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && list.length > 1) {
        setIndex((i) => (i - 1 + list.length) % list.length);
      }
      if (e.key === 'ArrowRight' && list.length > 1) {
        setIndex((i) => (i + 1) % list.length);
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [list.length, onClose]);

  if (!list.length) return null;

  const safeIndex = Math.min(index, list.length - 1);
  const entry = list[safeIndex];
  const isVideo = isVideoMediaEntry(entry);

  const content = (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="View issue photo"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-white">
        <p className="min-w-0 truncate text-sm font-medium">
          {titleAlt}
          {list.length > 1 ? (
            <span className="ml-2 text-white/70">
              {safeIndex + 1} / {list.length}
            </span>
          ) : null}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Close"
        >
          <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6"
        onClick={onClose}
      >
        {list.length > 1 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + list.length) % list.length);
            }}
            className="absolute left-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 sm:left-4"
            aria-label="Previous photo"
          >
            <HiOutlineChevronLeft className="h-7 w-7" aria-hidden="true" />
          </button>
        ) : null}

        <div
          className="max-h-[calc(100vh-8rem)] max-w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {isVideo ? (
            <video
              src={entry.url}
              controls
              playsInline
              className="max-h-[calc(100vh-8rem)] max-w-[min(100vw-2rem,56rem)]"
              aria-label={`${titleAlt} ${safeIndex + 1}`}
            />
          ) : (
            <img
              src={entry.url}
              alt={`${titleAlt} ${safeIndex + 1}`}
              className="max-h-[calc(100vh-8rem)] max-w-[min(100vw-2rem,56rem)] object-contain"
            />
          )}
        </div>

        {list.length > 1 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % list.length);
            }}
            className="absolute right-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 sm:right-4"
            aria-label="Next photo"
          >
            <HiOutlineChevronRight className="h-7 w-7" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default JobMediaLightbox;