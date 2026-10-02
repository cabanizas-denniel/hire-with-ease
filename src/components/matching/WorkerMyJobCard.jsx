import {
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineMapPin,
} from 'react-icons/hi2';
import HomeownerTrustRow from '../HomeownerTrustRow.jsx';
import { useJob } from '../../lib/matching/hooks.js';
import { getJobMediaEntries, isVideoMediaEntry } from '../../utils/jobMedia.js';

/**
 * Instagram-style 4:5 card for worker My Jobs.
 * Hero uses the homeowner’s submitted issue photo (not a profile avatar).
 */
function WorkerMyJobCard({ application, selected, statusLabel, onSelect }) {
  const { data: job } = useJob(application.jobId);
  const media = getJobMediaEntries(job);
  const cover = media[0] || null;
  const extraCount = Math.max(0, media.length - 1);
  const title = application.jobTitle || job?.title || 'Job';
  const address =
    job?.location?.barangay ||
    job?.location?.label ||
    null;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(application)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(application);
        }
      }}
      aria-pressed={selected}
      aria-label={selected ? `Chatting about ${title}` : `Open chat for ${title}`}
      className={`group relative flex aspect-[4/5] cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_12px_28px_rgba(8,45,90,0.18)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(8,45,90,0.24)] ${
        selected
          ? 'border-[#1F4E79] ring-2 ring-[#1F4E79]/30'
          : 'border-[#1F4E79]/20'
      }`}
    >
      <div className="relative flex-[1.15] overflow-hidden bg-gradient-to-br from-[#1a3d5c] via-[#2E75B6] to-[#5eb0d8]">
        {cover ? (
          isVideoMediaEntry(cover) ? (
            <video
              src={cover.url}
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden="true"
            />
          ) : (
            <img
              src={cover.url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
            />
          )
        ) : null}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0d2a44]/90 via-[#0d2a44]/35 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          <span
            className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${
              selected
                ? 'bg-[#1F4E79] text-white'
                : 'bg-white/95 text-[#1F4E79]'
            }`}
          >
            {selected ? 'Chatting' : statusLabel}
          </span>
          {extraCount > 0 ? (
            <span className="rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
              +{extraCount} photos
            </span>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 p-3.5">
          <p className="line-clamp-2 text-base font-semibold leading-tight text-white drop-shadow-sm sm:text-lg">
            {title}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-white/90">
            <span>{application.clientName || 'Homeowner'}</span>
            <HomeownerTrustRow
              name={null}
              trustTier={
                application.clientTrustTier ?? job?.postedByTrustTier ?? null
              }
              prefix=""
              className="mt-0"
            />
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3.5 pb-3 pt-2.5">
        <ul className="space-y-1.5 text-[11px] text-gray-600">
          {address ? (
            <li className="flex items-start gap-1.5">
              <HiOutlineMapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1F4E79]" aria-hidden="true" />
              <span className="line-clamp-1">{address}, Olongapo</span>
            </li>
          ) : null}
          {job?.budget ? (
            <li className="flex items-start gap-1.5">
              <HiOutlineBanknotes className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1F4E79]" aria-hidden="true" />
              <span className="line-clamp-1">{job.budget}</span>
            </li>
          ) : null}
          {job?.schedule ? (
            <li className="flex items-start gap-1.5">
              <HiOutlineCalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1F4E79]" aria-hidden="true" />
              <span className="line-clamp-2">{job.schedule}</span>
            </li>
          ) : null}
        </ul>

        <p className="mt-auto pt-3 text-center text-[11px] font-medium text-[#2E75B6]">
          {selected ? 'Chat open below' : 'Tap to open chat'}
        </p>
      </div>
    </article>
  );
}

export default WorkerMyJobCard;
