import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import { subscribeDisputeReports } from '../../lib/disputeReports.js';

function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeDisputeReports(
      (rows) => {
        setReports(rows);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  return (
    <div>
      <PageHeader
        title="Reports & disputes"
        subtitle="Flags from homeowners and workers. Chat history remains stored for review."
      />

      {loading ? (
        <p className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-sm">Loading…</p>
      ) : null}

      {!loading && reports.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-sm">
          No dispute reports yet.
        </p>
      ) : null}

      <ul className="mt-4 space-y-3">
        {reports.map((r) => (
          <li
            key={r.docId || r.id}
            className="rounded-xl border border-red-100 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#1F4E79]">{r.reason}</h3>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                {r.status || 'open'}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Job: <span className="font-mono">{r.jobId}</span>
              {r.threadId ? (
                <>
                  {' '}
                  · Thread: <span className="font-mono">{r.threadId}</span>
                </>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Reporter: {r.reporterRole} ({r.reporterId})
              {r.reportedUserId ? ` → Reported: ${r.reportedUserId}` : ''}
            </p>
            {r.details ? (
              <p className="mt-2 text-sm text-gray-700">{r.details}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminReportsPage;
