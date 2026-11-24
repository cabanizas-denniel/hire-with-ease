import SkillBadge from './SkillBadge.jsx';

function WorkerCard({
  applicant,
  onViewProfile,
  onSelect,
  matchedSkills = [],
  showActions = true,
}) {
  const certifications = Array.isArray(applicant.certifications) ? applicant.certifications : [];
  const certificationCount = certifications.length;

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--hwe-accent)] text-sm font-bold text-[var(--hwe-slate)]">
            {applicant.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[var(--hwe-slate)]">{applicant.name}</h3>
              {applicant.verified ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Verified</span>
              ) : null}
            </div>
            <p className="text-sm text-gray-600">{applicant.location}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {applicant.rating != null ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              &#9733; {applicant.rating}
            </span>
          ) : null}
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {applicant.jobsCompleted} jobs done
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(applicant.skills || []).map((skill) => {
          const isPrimary =
            applicant.primarySkill === skill ||
            (!applicant.primarySkill && skill === applicant.skills?.[0]);
          return (
            <span
              key={skill}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isPrimary
                  ? 'bg-[var(--hwe-accent)] text-[var(--hwe-slate)]'
                  : matchedSkills.includes(skill)
                    ? 'bg-[var(--hwe-accent)] text-[var(--hwe-slate)]'
                    : 'bg-[var(--hwe-sky-soft)] text-[var(--hwe-slate)]'
              }`}
              title={isPrimary ? 'Primary skill' : 'Additional skill'}
            >
              {isPrimary ? `${skill} · Primary` : skill}
            </span>
          );
        })}
      </div>

      {applicant.completionRate != null ? (
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span>{applicant.completionRate}% completion rate</span>
          <span>{applicant.yearsExperience} yrs</span>
        </div>
      ) : null}

      {certificationCount > 0 ? (
        <div className="mt-3">
          <span className="inline-flex rounded-full bg-[var(--hwe-sky-soft)] px-3 py-1 text-xs font-medium text-[var(--hwe-slate)]">
            {certificationCount} certification{certificationCount === 1 ? '' : 's'} uploaded
          </span>
        </div>
      ) : null}

      {showActions && (onViewProfile || onSelect) ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {onViewProfile ? (
            <button
              type="button"
              onClick={() => onViewProfile(applicant)}
              className="cursor-pointer w-full rounded-lg border border-[var(--hwe-slate)] px-4 py-2 text-sm font-medium text-[var(--hwe-slate)]"
            >
              View Profile
            </button>
          ) : null}
          {onSelect ? (
            <button
              type="button"
              onClick={() => onSelect(applicant)}
              className="cursor-pointer w-full btn-primary"
            >
              Select Worker
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default WorkerCard;
