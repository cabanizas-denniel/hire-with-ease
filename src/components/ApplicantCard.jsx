import SkillBadge from './SkillBadge.jsx';

function WorkerCard({ applicant, onViewProfile, onSelect, matchedSkills = [] }) {
  const certifications = Array.isArray(applicant.certifications) ? applicant.certifications : [];
  const certificationCount = certifications.length;

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F4E79] text-sm font-bold text-white">
            {applicant.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[#1F4E79]">{applicant.name}</h3>
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
        {applicant.skills.map((skill) => (
          <span
            key={skill}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              matchedSkills.includes(skill)
                ? 'bg-[#1F4E79] text-white'
                : 'bg-[#2E75B6]/10 text-[#1F4E79]'
            }`}
          >
            {skill}
          </span>
        ))}
      </div>

      {applicant.completionRate != null ? (
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span>{applicant.completionRate}% completion rate</span>
          <span>{applicant.yearsExperience} yrs</span>
        </div>
      ) : null}

      {certificationCount > 0 ? (
        <div className="mt-3">
          <span className="inline-flex rounded-full bg-[#2E75B6]/10 px-3 py-1 text-xs font-medium text-[#1F4E79]">
            {certificationCount} certification{certificationCount === 1 ? '' : 's'} uploaded
          </span>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => onViewProfile?.(applicant)}
          className="cursor-pointer w-full rounded-lg border border-[#1F4E79] px-4 py-2 text-sm font-medium text-[#1F4E79]"
        >
          View Profile
        </button>
        <button
          type="button"
          onClick={() => onSelect?.(applicant)}
          className="cursor-pointer w-full rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-medium text-white"
        >
          Select Worker
        </button>
      </div>
    </article>
  );
}

export default WorkerCard;
