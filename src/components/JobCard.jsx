import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { HiOutlineCheck, HiOutlineMapPin } from 'react-icons/hi2';
import { formatPostedDate } from '../lib/scheduleFormat.js';
import { getJobMediaEntries } from '../utils/jobMedia.js';
import HomeownerTrustRow from './HomeownerTrustRow.jsx';
import JobIssueMedia from './JobIssueMedia.jsx';
import SkillBadge from './SkillBadge.jsx';
import StatusBadge from './StatusBadge.jsx';

const TOOLTIP_W = 220;
const TOOLTIP_H = 150;

function tooltipPosition(x, y) {
  const pad = 8;
  const offset = 16;
  let left = x + offset;
  let top = y + offset;
  if (typeof window !== 'undefined') {
    if (left + TOOLTIP_W > window.innerWidth - pad) left = x - TOOLTIP_W - offset;
    if (top + TOOLTIP_H > window.innerHeight - pad) top = y - TOOLTIP_H - offset;
    left = Math.max(pad, left);
    top = Math.max(pad, top);
  }
  return { left, top };
}

function JobCard({
  job,
  onAccept,
  onDecline,
  onViewDetails,
  compact = false,
  showDescription = false,
  showFullMedia = false,
  declineLabel = 'Not Interested',
  acceptLabel = 'Accept',
  statusTag = null,
  clientTrustTier = null,
  matchReasons,
  /** When set (unverified workers), replaces Accept/Decline with a profile link. */
  verificationHref = null,
  verificationLabel = 'Profile Verification',
}) {
  const [cursor, setCursor] = useState(null);
  const trustTier =
    clientTrustTier ?? job.postedByTrustTier ?? job.clientTrustTier ?? null;
  const isRush = job.type === 'Rush';
  const hasMedia = getJobMediaEntries(job).length > 0;
  const postedLabel = formatPostedDate(job.postedAt, job.createdAt);
  const topMatch = matchReasons?.[0] || null;
  const hasMatchWhy = Boolean(matchReasons?.length);
  const tipPos = cursor ? tooltipPosition(cursor.x, cursor.y) : null;

  return (
    <article
      className="relative flex h-full flex-col"
      onMouseMove={
        hasMatchWhy
          ? (e) => setCursor({ x: e.clientX, y: e.clientY })
          : undefined
      }
      onMouseLeave={hasMatchWhy ? () => setCursor(null) : undefined}
    >
      {hasMatchWhy && tipPos
        ? createPortal(
            <div
              className="pointer-events-none fixed z-[200] w-[220px] rounded-xl border border-[#1F4E79]/20 bg-white p-3 shadow-[0_10px_28px_rgba(8,45,90,0.22)]"
              style={{ left: tipPos.left, top: tipPos.top }}
              role="tooltip"
            >
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#2E75B6]">
                Why you were matched
              </p>
              <ul className="space-y-1 text-xs text-gray-700">
                {matchReasons.slice(0, 4).map((reason) => (
                  <li key={reason} className="leading-snug">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>,
            document.body,
          )
        : null}

      <div
        className={`panel-surface flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#1F4E79]/20 bg-white ${
          isRush ? 'ring-2 ring-amber-300' : ''
        }`}
      >
        {hasMedia ? (
          <JobIssueMedia
            job={job}
            variant={showFullMedia ? 'gallery' : 'card'}
            compact={!showFullMedia}
            titleAlt={`Photo for "${job.title}"`}
          />
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-sm font-semibold text-[#1F4E79]">{job.title}</h3>
              {job.clientName || trustTier != null ? (
                <HomeownerTrustRow name={job.clientName} trustTier={trustTier} />
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {statusTag ? (
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  {statusTag}
                </span>
              ) : null}
              {isRush ? (
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                  Rush
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-1.5 space-y-0.5 text-xs text-gray-600">
            <p className="flex min-w-0 items-center gap-1">
              <HiOutlineMapPin className="h-3.5 w-3.5 shrink-0 text-[#1F4E79]" aria-hidden="true" />
              <span className="truncate">{job.location || 'Location pending'}</span>
            </p>
            <p className="truncate">
              {[job.budget, !compact ? job.schedule : null].filter(Boolean).join(' · ')}
            </p>
            {postedLabel ? <p className="text-[11px] text-gray-400">Posted {postedLabel}</p> : null}
          </div>

          {showDescription && job.description ? (
            <p className="mt-2 line-clamp-2 text-xs text-gray-700">{job.description}</p>
          ) : null}

          {job.requiredSkills?.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {job.requiredSkills.slice(0, 2).map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
              {job.requiredSkills.length > 2 ? (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                  +{job.requiredSkills.length - 2}
                </span>
              ) : null}
            </div>
          ) : null}

          {hasMatchWhy ? (
            <p className="mt-2 truncate rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-900">
              {topMatch}
            </p>
          ) : null}

          {verificationHref ? (
            <div className="mt-auto pt-3">
              <Link
                to={verificationHref}
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-gradient-to-b from-[#2E75B6] to-[#1F4E79] px-3 py-2 text-xs font-semibold text-white hover:brightness-110"
              >
                {verificationLabel}
              </Link>
            </div>
          ) : null}

          {!verificationHref && !compact && (onDecline || onAccept || onViewDetails) ? (
            <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
              {onDecline ? (
                <button
                  type="button"
                  onClick={() => onDecline(job)}
                  className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  {declineLabel}
                </button>
              ) : (
                <span />
              )}
              {onAccept ? (
                <button
                  type="button"
                  onClick={() => onAccept(job)}
                  className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-gradient-to-b from-[#2E75B6] to-[#1F4E79] px-3 py-2 text-xs font-semibold text-white hover:brightness-110"
                >
                  <HiOutlineCheck className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
                  {acceptLabel}
                </button>
              ) : null}
              {onViewDetails ? (
                <button
                  type="button"
                  onClick={() => onViewDetails(job)}
                  className="col-span-2 cursor-pointer rounded-lg border border-[#1F4E79] px-3 py-2 text-xs font-medium text-[#1F4E79]"
                >
                  View Details
                </button>
              ) : null}
            </div>
          ) : null}
          {!verificationHref && compact ? (
            <div className="mt-2">
              <StatusBadge status={job.status} />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default JobCard;
