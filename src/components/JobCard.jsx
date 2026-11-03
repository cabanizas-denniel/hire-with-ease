import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineMapPin,
} from 'react-icons/hi2';
import { formatPostedDate } from '../lib/scheduleFormat.js';
import { getJobMediaEntries, isVideoMediaEntry } from '../utils/jobMedia.js';
import HomeownerTrustRow from './HomeownerTrustRow.jsx';

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

function locationText(job) {
  if (!job) return null;
  if (typeof job.location === 'string' && job.location.trim()) return job.location.trim();
  const barangay = job.location?.barangay;
  const label = job.location?.label;
  if (barangay) return `${barangay}, Olongapo`;
  if (label) return label;
  return null;
}

/**
 * Matched / browse job card — same visual language as WorkerMyJobCard
 * (hero issue photo, overlay title, icon detail rows).
 */
function JobCard({
  job,
  onAccept,
  onDecline,
  onViewDetails,
  compact = false,
  showDescription = false,
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
  const media = getJobMediaEntries(job);
  const cover = media[0] || null;
  const extraCount = Math.max(0, media.length - 1);
  const postedLabel = formatPostedDate(job.postedAt, job.createdAt);
  const address = locationText(job);
  const topMatch = matchReasons?.[0] || null;
  const hasMatchWhy = Boolean(matchReasons?.length);
  const tipPos = cursor ? tooltipPosition(cursor.x, cursor.y) : null;
  const hasActions = Boolean(
    verificationHref || (!compact && (onDecline || onAccept || onViewDetails)),
  );
  const badgeLabel = statusTag || (isRush ? 'Rush' : 'Match');

  return (
    <article
      className="relative h-full"
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
        className={`group relative flex aspect-[4/5] h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_12px_28px_rgba(8,45,90,0.18)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(8,45,90,0.24)] ${
          isRush ? 'border-amber-300 ring-2 ring-amber-300/60' : 'border-[#1F4E79]/20'
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
                isRush
                  ? 'bg-amber-400 text-[#1F4E79]'
                  : 'bg-white/95 text-[#1F4E79]'
              }`}
            >
              {badgeLabel}
            </span>
            {extraCount > 0 ? (
              <span className="rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                +{extraCount} photos
              </span>
            ) : null}
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 p-3.5">
            <p className="line-clamp-2 text-base font-semibold leading-tight text-white drop-shadow-sm sm:text-lg">
              {job.title || 'Job'}
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-white/90">
              {job.clientName || trustTier != null ? (
                <>
                  {job.clientName ? <span>{job.clientName}</span> : null}
                  <HomeownerTrustRow
                    name={null}
                    trustTier={trustTier}
                    prefix=""
                    className="mt-0"
                  />
                </>
              ) : (
                <span>Homeowner</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3.5 pb-3 pt-2.5">
          <ul className="space-y-1.5 text-[11px] text-gray-600">
            {address ? (
              <li className="flex items-start gap-1.5">
                <HiOutlineMapPin
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1F4E79]"
                  aria-hidden="true"
                />
                <span className="line-clamp-1">{address}</span>
              </li>
            ) : null}
            {job.budget ? (
              <li className="flex items-start gap-1.5">
                <HiOutlineBanknotes
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1F4E79]"
                  aria-hidden="true"
                />
                <span className="line-clamp-1">{job.budget}</span>
              </li>
            ) : null}
            {job.schedule ? (
              <li className="flex items-start gap-1.5">
                <HiOutlineCalendarDays
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1F4E79]"
                  aria-hidden="true"
                />
                <span className="line-clamp-2">{job.schedule}</span>
              </li>
            ) : null}
            {postedLabel ? (
              <li className="flex items-start gap-1.5">
                <HiOutlineClock
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1F4E79]"
                  aria-hidden="true"
                />
                <span className="line-clamp-1">Posted {postedLabel}</span>
              </li>
            ) : null}
          </ul>

          {showDescription && job.description ? (
            <p className="mt-2 line-clamp-2 text-[11px] text-gray-700">{job.description}</p>
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

          {!hasActions ? (
            <p className="mt-auto pt-3 text-center text-[11px] font-medium text-[#2E75B6]">
              Open Jobs to accept
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default JobCard;
