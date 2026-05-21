import {
  HiOutlineAcademicCap,
  HiOutlineMapPin,
  HiOutlineStar,
  HiOutlineUserCircle,
} from 'react-icons/hi2';
import SkillBadge from '../SkillBadge.jsx';

/**
 * Employer review card (spec step 3: profile, portfolio, ratings, skills, proximity, certs).
 */
function WorkerMatchDetailCard({ entry, onChat, onSelect, selected }) {
  const { profile, score, reasons, matchedSkills } = entry;
  const name = profile?.name || 'Worker';
  const certs = profile?.certifications || [];
  const portfolio = [
    profile?.experienceLevel && `${profile.experienceLevel} level`,
    profile?.yearsExperience != null && `${profile.yearsExperience} yrs experience`,
    profile?.preferredCategories?.length &&
      `Prefers: ${profile.preferredCategories.slice(0, 3).join(', ')}`,
  ].filter(Boolean);

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm transition ${
        selected ? 'border-[#1F4E79] ring-2 ring-[#1F4E79]/25' : 'border-gray-200'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1F4E79] text-sm font-bold text-white">
            {name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#1F4E79]">{name}</h3>
            <p className="flex items-center gap-1 text-xs text-gray-600">
              <HiOutlineMapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {formatLocation(profile)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {profile?.rating != null ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
              <HiOutlineStar className="h-3.5 w-3.5" aria-hidden="true" />
              {profile.rating}
            </span>
          ) : null}
          <span className="rounded-full bg-[#2E75B6]/10 px-2 py-0.5 text-[10px] font-medium text-[#1F4E79]">
            Match {Math.round(score)}%
          </span>
        </div>
      </div>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-gray-500">Profile</dt>
          <dd className="mt-0.5 text-gray-700">
            {profile?.jobsCompleted ?? 0} jobs completed
            {profile?.completionRate != null ? ` · ${profile.completionRate}% completion` : ''}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-500">Portfolio</dt>
          <dd className="mt-0.5 text-gray-700">
            {portfolio.length ? portfolio.join(' · ') : '—'}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-gray-500">Skills</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {(profile?.skills || []).map((s) => (
              <span
                key={s}
                className={
                  matchedSkills?.includes(s) ? 'inline-block rounded-full ring-1 ring-[#1F4E79]' : 'inline-block'
                }
              >
                <SkillBadge skill={s} />
              </span>
            ))}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-gray-500">Proximity & match</dt>
          <dd className="mt-0.5 text-gray-700">
            {reasons?.length ? reasons.join(' · ') : 'Skill overlap'}
          </dd>
        </div>
        {certs.length > 0 ? (
          <div className="sm:col-span-2">
            <dt className="inline-flex items-center gap-1 font-semibold text-gray-500">
              <HiOutlineAcademicCap className="h-3.5 w-3.5" aria-hidden="true" />
              Certifications
            </dt>
            <dd className="mt-0.5 text-gray-700">
              {certs.map((c) => c.label || c.type || c).join(', ')}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        {onChat ? (
          <button
            type="button"
            onClick={() => onChat(entry)}
            className="rounded-lg border border-[#1F4E79] px-3 py-1.5 text-xs font-semibold text-[#1F4E79] hover:bg-blue-50"
          >
            Chat & negotiate
          </button>
        ) : null}
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(entry)}
            className="rounded-lg bg-[#1F4E79] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Select worker
          </button>
        ) : null}
      </div>
    </article>
  );
}

function formatLocation(profile) {
  const loc = profile?.location;
  if (!loc) return 'Olongapo';
  if (typeof loc === 'string') return loc;
  const parts = [loc.barangay, loc.label].filter(Boolean);
  return parts.length ? `${parts.join(' · ')}, Olongapo` : 'Olongapo';
}

export default WorkerMatchDetailCard;
