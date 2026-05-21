import { useEffect, useState } from 'react';
import { HiOutlineCalendarDays, HiOutlineXMark } from 'react-icons/hi2';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import { buildThreadId } from '../../lib/matching/threads.js';

/**
 * Homeowner sets agreed work window + price (spec 4c — calendar, no escrow).
 */
function ScheduleAgreementModal({
  isOpen,
  onClose,
  jobId,
  workerId,
  initialPrice = '',
  onSaved,
}) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [price, setPrice] = useState(initialPrice);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setPrice(initialPrice || '');
    setError(null);
  }, [isOpen, initialPrice]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!startDate || !endDate) {
      setError('Pick a start and end date.');
      return;
    }
    if (endDate < startDate) {
      setError('End date must be on or after the start date.');
      return;
    }
    if (!price?.trim()) {
      setError('Enter the agreed price.');
      return;
    }
    const threadId = buildThreadId(jobId, workerId);
    if (!threadId || !db) {
      setError('Could not save schedule.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await setDoc(
        doc(db, 'threads', threadId),
        {
          scheduleAgreement: {
            startDate,
            endDate,
            price: price.trim(),
            setAt: new Date().toISOString(),
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      onSaved?.({ startDate, endDate, price: price.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-agreement-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <HiOutlineCalendarDays className="h-5 w-5 text-[#1F4E79]" aria-hidden="true" />
            <h2 id="schedule-agreement-title" className="text-sm font-semibold text-[#1F4E79]">
              Agreed schedule & price
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-xs text-gray-600">
            Record the dates and price you agreed in chat. This is for your records only — not
            online payment.
          </p>
          <label className="block text-xs font-medium text-gray-600">
            Start date
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-gray-600">
            End date
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-gray-600">
            Agreed price
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. PHP 1,500"
            />
          </label>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="w-full rounded-lg bg-[#1F4E79] py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save agreement'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleAgreementModal;
