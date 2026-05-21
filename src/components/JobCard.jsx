import { HiOutlineMapPin } from 'react-icons/hi2';
import { getJobMediaEntries } from '../utils/jobMedia.js';
import HomeownerTrustRow from './HomeownerTrustRow.jsx';
import JobIssueMedia from './JobIssueMedia.jsx';
import SkillBadge from './SkillBadge.jsx';
import StatusBadge from './StatusBadge.jsx';

function JobCard({
  job,
  onAccept,
  onDecline,
  onViewDetails,
  compact = false,
  showDescription = false,
  showFullMedia = false,
  declineLabel = 'Not Interested',
  clientTrustTier = null,
  matchReasons,
}) {
  const trustTier =
    clientTrustTier ?? job.postedByTrustTier ?? job.clientTrustTier ?? null;
  const isRush = job.type === 'Rush';
  const hasMedia = getJobMediaEntries(job).length > 0;

  return (
    <article className={`overflow-hidden rounded-xl bg-white shadow-sm ${isRush ? 'ring-2 ring-amber-300' : ''}`}>
      {hasMedia ? (
        <JobIssueMedia
          job={job}
          variant={showFullMedia ? 'gallery' : 'card'}
          compact={compact && !showFullMedia}
          titleAlt={`Photo for "${job.title}"`}
        />
      ) : null}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#1F4E79]">{job.title}</h3>
            {job.clientName || trustTier != null ? (
              <HomeownerTrustRow name={job.clientName} trustTier={trustTier} />
            ) : null}
          </div>
          <span
            className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
              isRush
                ? 'bg-amber-100 text-amber-800'
                : 'bg-[#2E75B6]/10 text-[#1F4E79]'
            }`}
          >
            {job.type}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1">
            <HiOutlineMapPin className="h-3.5 w-3.5 text-[#1F4E79]" aria-hidden="true" />
            {job.location || 'Location pending'}
          </span>
          {job.budget ? <span>{job.budget}</span> : null}
        </div>
        {!compact && job.schedule ? (
          <p className="mt-1 text-sm text-gray-500">{job.schedule}</p>
        ) : null}

        {showDescription && job.description ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{job.description}</p>
        ) : null}

        {job.requiredSkills?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {job.requiredSkills.map((skill) => (
              <SkillBadge key={skill} skill={skill} />
            ))}
          </div>
        ) : null}

        {matchReasons ? (
          <div className="mt-3 rounded-lg bg-green-50 px-3 py-2">
            <p className="text-xs font-medium text-green-800">Why you were matched</p>
            <ul className="mt-1 space-y-0.5 text-xs text-green-700">
              {matchReasons.map((reason) => (
                <li key={reason}>&#x2022; {reason}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {!compact ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {onDecline ? (
              <button
                type="button"
                onClick={() => onDecline(job)}
                className="cursor-pointer w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                {declineLabel}
              </button>
            ) : null}
            {onViewDetails ? (
              <button
                type="button"
                onClick={() => onViewDetails(job)}
                className="cursor-pointer w-full rounded-lg border border-[#1F4E79] px-4 py-2 text-sm font-medium text-[#1F4E79]"
              >
                View Details
              </button>
            ) : null}
            {onAccept ? (
              <button
                type="button"
                onClick={() => onAccept(job)}
                className="cursor-pointer w-full rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-medium text-white"
              >
                Accept Job
              </button>
            ) : null}
          </div>
        ) : (
          <div className="mt-3">
            <StatusBadge status={job.status} />
          </div>
        )}
      </div>
    </article>
  );
}

export default JobCard;
