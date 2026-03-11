import SkillBadge from './SkillBadge.jsx';

function JobCard({ job, onApply, onViewDetails, compact = false }) {
  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-[#1F4E79]">{job.title}</h3>
        <span className="rounded-md bg-[#2E75B6]/10 px-2 py-1 text-xs font-medium text-[#1F4E79]">{job.type}</span>
      </div>
      <p className="mt-2 text-sm text-gray-600">{job.location}</p>
      <p className="mt-1 text-sm text-gray-700">{job.payRange}</p>
      {!compact ? <p className="mt-2 text-sm text-gray-600">{job.schedule}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {job.requiredSkills.map((skill) => (
          <SkillBadge key={skill} skill={skill} />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => onViewDetails?.(job)}
          className="w-full rounded-lg border border-[#1F4E79] px-4 py-2 text-sm font-medium text-[#1F4E79]"
        >
          View Details
        </button>
        <button
          type="button"
          onClick={() => onApply?.(job)}
          className="w-full rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-medium text-white"
        >
          Apply
        </button>
      </div>
    </article>
  );
}

export default JobCard;
