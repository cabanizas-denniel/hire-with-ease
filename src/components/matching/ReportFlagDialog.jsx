import { useState } from 'react';
import { HiOutlineFlag, HiOutlineXMark } from 'react-icons/hi2';
import { submitDisputeReport } from '../../lib/disputeReports.js';

const REASONS = [
  'Fraudulent check-in / check-out',
  'No-show',
  'Harassment or abuse',
  'Misleading job details',
  'Payment dispute (off-platform)',
  'Other',
];

function ReportFlagDialog({
  jobId,
  threadId,
  reporterId,
  reporterRole,
  reportedUserId,
  reportedLabel = 'this user',
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setBusy(true);
    try {
      await submitDisputeReport({
        jobId,
        threadId,
        reporterId,
        reporterRole,
        reportedUserId,
        reason,
        details,
      });
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setDetails('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Could not submit report.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
        title="Report to PESO admin"
      >
        <HiOutlineFlag className="h-3.5 w-3.5" aria-hidden="true" />
        Report
      </button>
      {open ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1F4E79]">Report {reportedLabel}</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <HiOutlineXMark className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              PESO admins can review chat history and this report.
            </p>
            {done ? (
              <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">
                Report submitted. Thank you.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                <select
                  className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
                  rows={3}
                  placeholder="Additional details (optional)"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={busy}
                  className="w-full rounded-lg bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {busy ? 'Sending…' : 'Submit report'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ReportFlagDialog;
