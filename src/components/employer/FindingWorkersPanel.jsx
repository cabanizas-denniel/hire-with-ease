import WorkerMatchDetailCard from '../matching/WorkerMatchDetailCard.jsx';

function FindingWorkersPanel({
  searching,
  matches,
  jobTitle,
  appliedWorkerIds = new Set(),
  acceptedCount = 0,
  chatWorkerId,
  onChat,
  onDecline,
  hireLocked = false,
}) {
  if (searching) {
    return (
      <section className="panel-surface mb-6 overflow-hidden rounded-xl border border-[#1F4E79]/20 bg-gradient-to-br from-blue-50 to-white p-6">
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
              location, category fit, and ratings.
            </p>
            <ul className="mt-3 space-y-1 text-left text-xs text-gray-500">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2E75B6]" />
                Weighted scoring (skills, barangay, reputation)
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

  const acceptedLabel =
    acceptedCount > 0
      ? ` · ${acceptedCount} accepted`
      : '';

  return (
    <section className="mb-6 space-y-4">
      <div className="panel-surface rounded-xl border border-emerald-200/80 bg-white p-4">
        <h2 className="text-base font-semibold text-emerald-900">
          {hireLocked
            ? 'Hired worker'
            : matches.length > 0
              ? `${matches.length} worker${matches.length === 1 ? '' : 's'} matched${acceptedLabel}`
              : 'No workers on file match yet'}
        </h2>
        <p className="mt-1 text-sm text-emerald-900/80">
          {hireLocked
            ? 'Schedule is confirmed. Chat and payment for this hire are below.'
            : matches.length > 0
              ? acceptedCount > 0
                ? 'Tap an accepted card to chat. Decline removes a worker from this request permanently.'
                : 'Waiting for shortlisted workers to accept. You can Decline anyone to remove them from this request.'
              : 'No workers met the criteria yet. Your request stays live for new matches.'}
        </p>
      </div>

      {matches.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {matches.map((entry) => {
            const id = entry.profile?.docId || entry.profile?.uid;
            const hasAccepted = id ? appliedWorkerIds.has(id) : false;
            return (
              <li key={id} className="min-w-0">
                <WorkerMatchDetailCard
                  entry={entry}
                  selected={chatWorkerId === id}
                  status={hasAccepted ? 'accepted' : 'waiting'}
                  onChat={hasAccepted ? onChat : undefined}
                  onDecline={onDecline}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

export default FindingWorkersPanel;
