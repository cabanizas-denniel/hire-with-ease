import SkillBadge from './SkillBadge.jsx';
import StatusBadge from './StatusBadge.jsx';

function JobCard({ job, onAccept, onDecline, onViewDetails, compact = false, matchReasons }) {
  const isRush = job.type === 'Rush';

  return (
    <article className={`rounded-xl bg-white p-4 shadow-sm ${isRush ? 'ring-2 ring-amber-300' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#1F4E79]">{job.title}</h3>
          {job.clientName ? (
            <p className="mt-0.5 text-xs text-gray-500">Requested by {job.clientName}</p>
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
        <span>{job.location}</span>
        <span>{job.budget}</span>
      </div>
      {!compact ? <p className="mt-1 text-sm text-gray-500">{job.schedule}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {job.requiredSkills.map((skill) => (
          <SkillBadge key={skill} skill={skill} />
        ))}
      </div>

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
          {onViewDetails ? (
            <button
              type="button"
              onClick={() => onViewDetails(job)}
              className="cursor-pointer w-full rounded-lg border border-[#1F4E79] px-4 py-2 text-sm font-medium text-[#1F4E79]"
            >
              View Details
            </button>
          ) : null}
          {onDecline ? (
            <button
              type="button"
              onClick={() => onDecline(job)}
              className="cursor-pointer w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600"
            >
              Not Interested
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
    </article>
  );
}

export default JobCard;
