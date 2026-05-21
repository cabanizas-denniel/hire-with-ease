import WorkerCard from '../ApplicantCard.jsx';

function workerLocationLabel(profile) {
  const loc = profile?.location;
  if (!loc) return 'Olongapo';
  if (typeof loc === 'string') return loc;
  const parts = [loc.barangay, loc.label].filter(Boolean);
  return parts.length ? `${parts.join(' · ')}, Olongapo` : 'Olongapo';
}

function toWorkerCardModel(entry) {
  const { profile, matchedSkills } = entry;
  return {
    id: profile.docId || profile.uid,
    name: profile.name || 'Worker',
    location: workerLocationLabel(profile),
    skills: profile.skills || [],
    rating: profile.rating ?? null,
    jobsCompleted: profile.jobsCompleted ?? 0,
    verified: Boolean(profile.verified),
    certifications: profile.certifications || [],
  };
}

function FindingWorkersPanel({ searching, matches, jobTitle }) {
  if (searching) {
    return (
      <section className="mb-6 overflow-hidden rounded-xl border border-[#1F4E79]/20 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
          <div
            className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1F4E79]/10 sm:mb-0 sm:mr-4"
            aria-hidden="true"
          >
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1F4E79]/20 border-t-[#1F4E79]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-[#1F4E79]">Finding qualified workers…</h2>
            <p className="mt-1 text-sm text-gray-600">
              Running the matching engine for{' '}
              <span className="font-medium">{jobTitle || 'your request'}</span> — skills,
              schedule, location, and ratings.
            </p>
            <ul className="mt-3 space-y-1 text-left text-xs text-gray-500">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2E75B6]" />
                Weighted scoring (skills, barangay, availability)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2E75B6] [animation-delay:150ms]" />
                Greedy best-first candidate pool
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2E75B6] [animation-delay:300ms]" />
                A* shortlist (up to 5 workers)
              </li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6 space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
        <h2 className="text-base font-semibold text-emerald-900">
          {matches.length > 0
            ? `${matches.length} worker${matches.length === 1 ? '' : 's'} match your request`
            : 'No workers on file match yet'}
        </h2>
        <p className="mt-1 text-sm text-emerald-800/90">
          {matches.length > 0
            ? 'The engine picked up to five best-fit workers for you to review. Check your notification bell if you missed the alert. Applicants who respond appear below.'
            : 'No workers met all criteria right now (skills + availability for your schedule). Your request stays live — check back for applicants.'}
        </p>
      </div>

      {matches.length > 0 ? (
        <ul className="space-y-3">
          {matches.map((entry) => {
            const worker = toWorkerCardModel(entry);
            return (
              <li key={worker.id}>
                <div className="relative">
                  <WorkerCard
                    applicant={worker}
                    matchedSkills={entry.matchedSkills}
                    showActions={false}
                  />
                  {entry.reasons?.length ? (
                    <div className="mx-4 -mt-2 mb-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-900">
                      <span className="font-semibold">Why matched: </span>
                      {entry.reasons.join(' · ')}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

export default FindingWorkersPanel;
