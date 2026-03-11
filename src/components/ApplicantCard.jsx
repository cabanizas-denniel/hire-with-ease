import SkillBadge from './SkillBadge.jsx';

function ApplicantCard({ applicant, onViewProfile, onHire, matchedSkills = [] }) {
  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1F4E79]">{applicant.name}</h3>
          <p className="text-sm text-gray-600">{applicant.location}</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {applicant.experienceLevel} ({applicant.yearsExperience} yrs)
        </span>
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

      {applicant.certifications.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {applicant.certifications.map((cert) => (
            <SkillBadge key={cert} skill={cert} />
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => onViewProfile?.(applicant)}
          className="w-full rounded-lg border border-[#1F4E79] px-4 py-2 text-sm font-medium text-[#1F4E79]"
        >
          View Profile
        </button>
        <button
          type="button"
          onClick={() => onHire?.(applicant)}
          className="w-full rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-medium text-white"
        >
          Hire
        </button>
      </div>
    </article>
  );
}

export default ApplicantCard;
