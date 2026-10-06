import { useEffect, useId, useState } from 'react';
import {
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineStar,
  HiOutlineXMark,
} from 'react-icons/hi2';

const FACTOR_STYLES = {
  skills: {
    bar: 'bg-[#1F4E79]',
    chip: 'bg-[#1F4E79]/10 text-[#1F4E79]',
  },
  location: {
    bar: 'bg-[#2E75B6]',
    chip: 'bg-[#2E75B6]/10 text-[#1F4E79]',
  },
  category: {
    bar: 'bg-teal-500',
    chip: 'bg-teal-50 text-teal-800',
  },
  reputation: {
    bar: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-800',
  },
  accepted: {
    bar: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-800',
  },
};

/**
 * Instagram-style 4:5 match card for the employer shortlist.
 * Match % badge toggles a friendly breakdown panel.
 * Accepted: whole card opens chat; Decline fills the bottom action strip.
 */
function WorkerMatchDetailCard({
  entry,
  selected,
  status = 'waiting',
  onChat,
  onDecline,
}) {
  const { profile, score, reasons, matchedSkills, breakdown } = entry;
  const name = profile?.name || 'Worker';
  const accepted = status === 'accepted';
  const panelId = useId();
  const [showBreakdown, setShowBreakdown] = useState(false);

  const primarySkill = profile?.primarySkill || (profile?.skills || [])[0] || null;
  const secondarySkills = Array.isArray(profile?.secondarySkills)
    ? profile.secondarySkills
    : (profile?.skills || []).slice(1);
  const skills = primarySkill
    ? [primarySkill, ...secondarySkills.filter((s) => s !== primarySkill)]
    : profile?.skills || [];
  const highlightSkills = (
    matchedSkills?.length
      ? [
          ...(primarySkill && matchedSkills.includes(primarySkill) ? [primarySkill] : []),
          ...matchedSkills.filter((s) => s !== primarySkill),
        ]
      : skills
  ).slice(0, 3);
  const extraSkills = Math.max(0, skills.length - highlightSkills.length);
  const experienceLine = [
    profile?.experienceLevel,
    profile?.yearsExperience != null ? `${profile.yearsExperience} yrs` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const breakdownItems = (breakdown?.length
    ? breakdown
    : (reasons || []).map((label, i) => ({
        key: `reason-${i}`,
        label,
        percent: null,
      }))
  ).slice(0, 4);

  useEffect(() => {
    setShowBreakdown(false);
  }, [profile?.docId || profile?.uid, score]);

  const handleCardActivate = () => {
    if (accepted && !showBreakdown) onChat?.(entry);
  };

  const handleCardKeyDown = (e) => {
    if (!accepted || showBreakdown) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChat?.(entry);
    }
  };

  const toggleBreakdown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowBreakdown((open) => !open);
  };

  return (
    <article
      role={accepted ? 'button' : undefined}
      tabIndex={accepted ? 0 : undefined}
      onClick={handleCardActivate}
      onKeyDown={handleCardKeyDown}
      aria-pressed={accepted ? selected : undefined}
      aria-label={
        accepted
          ? selected
            ? `Chatting with ${name}`
            : `Open chat with ${name}`
          : undefined
      }
      className={`group relative flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_12px_28px_rgba(8,45,90,0.18)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(8,45,90,0.24)] ${
        accepted ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-[#1F4E79] ring-2 ring-[#1F4E79]/30'
          : accepted
            ? 'border-emerald-300'
            : 'border-[#1F4E79]/20'
      }`}
    >
      <div className="relative flex-[1.05] overflow-hidden bg-gradient-to-br from-[#1a3d5c] via-[#2E75B6] to-[#5eb0d8]">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(245,185,66,0.35), transparent 40%)',
          }}
          aria-hidden="true"
        />
        <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={toggleBreakdown}
            aria-expanded={showBreakdown}
            aria-controls={panelId}
            title={showBreakdown ? 'Hide match breakdown' : 'See why they matched'}
            className={`cursor-pointer rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm transition ${
              showBreakdown
                ? 'bg-[#1F4E79] text-white ring-2 ring-white/70'
                : 'bg-white/95 text-[#1F4E79] hover:bg-white'
            }`}
          >
            {Math.round(score)}% match
          </button>
          {accepted ? (
            <span className="rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              {selected ? 'Chatting' : 'Accepted'}
            </span>
          ) : null}
          {profile?.rating != null ? (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-black/35 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
              <HiOutlineStar className="h-3 w-3 text-amber-300" aria-hidden="true" />
              {profile.rating}
            </span>
          ) : null}
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pb-2 pt-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/40 bg-[#0d2a44] text-2xl font-bold text-white shadow-lg sm:h-20 sm:w-20 sm:text-3xl">
            {name.charAt(0).toUpperCase()}
          </div>
          <p className="mt-2.5 line-clamp-2 text-center text-sm font-semibold leading-tight text-white drop-shadow-sm sm:text-base">
            {name}
          </p>
          <p className="mt-1 flex max-w-full items-center justify-center gap-1 px-2 text-center text-[11px] text-white/85">
            <HiOutlineMapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{formatLocation(profile)}</span>
          </p>
        </div>

        {showBreakdown ? (
          <div
            id={panelId}
            role="dialog"
            aria-label={`Why ${name} matched`}
            className="absolute inset-0 z-30 flex flex-col bg-[#0d2a44]/55 p-3 backdrop-blur-[2px]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="mt-auto overflow-hidden rounded-2xl border border-white/40 bg-white/95 shadow-[0_12px_28px_rgba(8,45,90,0.35)]">
              <div className="flex items-start justify-between gap-2 border-b border-[#1F4E79]/10 px-3 py-2.5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#2E75B6]">
                    Why they matched
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#1F4E79]">
                    {Math.round(score)}% overall match
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleBreakdown}
                  className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                  aria-label="Close match breakdown"
                >
                  <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <ul className="space-y-2.5 px-3 py-3">
                {breakdownItems.map((item) => {
                  const style = FACTOR_STYLES[item.key] || FACTOR_STYLES.skills;
                  const pct = typeof item.percent === 'number' ? item.percent : null;
                  return (
                    <li key={`${item.key}-${item.label}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.chip}`}
                        >
                          {item.label}
                        </span>
                        {pct != null ? (
                          <span className="shrink-0 text-xs font-bold tabular-nums text-[#1F4E79]">
                            {pct}%
                          </span>
                        ) : null}
                      </div>
                      {pct != null ? (
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${style.bar}`}
                            style={{ width: `${Math.min(100, Math.max(4, pct * 2))}%` }}
                          />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              <p className="border-t border-gray-100 px-3 py-2 text-[10px] leading-snug text-gray-500">
                Tap the match % again to close. Higher bars mean a stronger fit for that part.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2.5">
        <div className="flex items-baseline justify-between gap-2 text-[11px] text-gray-600">
          <span>
            {profile?.jobsCompleted ?? 0} jobs
            {profile?.completionRate != null ? ` · ${profile.completionRate}%` : ''}
          </span>
          {experienceLine ? (
            <span className="truncate text-right font-medium text-[#1F4E79]">
              {experienceLine}
            </span>
          ) : null}
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1">
          {primarySkill ? (
            <span className="rounded-md bg-[#1F4E79] px-2 py-0.5 text-[10px] font-semibold text-white">
              {primarySkill}
            </span>
          ) : null}
          {highlightSkills
            .filter((s) => s !== primarySkill)
            .map((s) => (
              <span
                key={s}
                className="rounded-md bg-[#2E75B6]/12 px-2 py-0.5 text-[10px] font-semibold text-[#1F4E79]"
              >
                {s}
              </span>
            ))}
          {extraSkills > 0 ? (
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
              +{extraSkills}
            </span>
          ) : null}
        </div>

        <p className="mt-2 text-[10px] text-gray-400">
          Tap <span className="font-semibold text-[#1F4E79]">{Math.round(score)}% match</span> to see
          why
        </p>

        <div className="mt-auto space-y-2 pt-2">
          {!accepted ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] font-medium text-amber-950">
              <HiOutlineClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="leading-tight">Waiting to accept</span>
            </div>
          ) : null}
          {onDecline ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDecline?.(entry);
              }}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
              Decline
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function formatLocation(profile) {
  const loc = profile?.location;
  if (!loc) return 'Olongapo';
  if (typeof loc === 'string') return loc;
  const barangay = loc.barangay || loc.label;
  return barangay ? `${barangay}, Olongapo` : 'Olongapo';
}

export default WorkerMatchDetailCard;
