import { useEffect, useState } from 'react';
import { HiOutlineCalendarDays, HiOutlineCheckBadge, HiOutlineXMark } from 'react-icons/hi2';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  confirmAgreement,
  proposeAgreement,
} from '../../lib/matching/agreements.js';
import { buildThreadId, sendMessage } from '../../lib/matching/threads.js';
import {
  notifyScheduleConfirmed,
  notifyScheduleProposed,
} from '../../lib/notifications.js';
import { formatScheduledStart } from '../../lib/scheduleFormat.js';

function scopeText(proposed) {
  if (!proposed) return '—';
  if (proposed.scope) return proposed.scope;
  const parts = [
    proposed.scopeIncluded ? `Included: ${proposed.scopeIncluded}` : null,
    proposed.scopeExcluded ? `Not included: ${proposed.scopeExcluded}` : null,
  ].filter(Boolean);
  return parts.join('\n') || '—';
}

/** Digits only — strips ₱, PHP, commas, spaces, etc. */
function priceDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatPriceLabel(digits) {
  const n = priceDigits(digits);
  if (!n) return '—';
  return `₱${Number(n).toLocaleString('en-PH')}`;
}

/**
 * Schedule modal: worker proposes start/price/scope; homeowner reviews + confirms.
 * All proposal fields are required. Mutual confirm locks the booking.
 */
function ScheduleAgreementModal({
  isOpen,
  onClose,
  jobId,
  workerId,
  clientId: clientIdProp = null,
  jobTitle: jobTitleProp = '',
  application,
  role,
  initialPrice = '',
}) {
  const { user } = useAuth();
  const isWorker = role === 'worker';
  const proposed = application?.proposedAgreement;
  const proposedBy = application?.proposedBy;
  const confirmedByClient = !!application?.confirmedByClient;
  const confirmedByWorker = !!application?.confirmedByWorker;
  const bothConfirmed = confirmedByClient && confirmedByWorker;

  const resolvedWorkerId = workerId || application?.workerId || null;
  const resolvedClientId = clientIdProp || application?.clientId || null;
  const resolvedJobTitle =
    jobTitleProp || application?.jobTitle || 'the job';

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [price, setPrice] = useState('');
  const [scope, setScope] = useState('');
  const [editing, setEditing] = useState(true);
  const [awaitingSendConfirm, setAwaitingSendConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setAwaitingSendConfirm(false);
    if (proposed) {
      setStartDate(proposed.startDate || '');
      setStartTime(proposed.startTime || '');
      setPrice(priceDigits(proposed.price || initialPrice || ''));
      setScope(
        proposed.scope ||
          [proposed.scopeIncluded, proposed.scopeExcluded].filter(Boolean).join('\n') ||
          '',
      );
      // Only the worker can edit / propose; homeowner is review-only.
      setEditing(isWorker && !bothConfirmed && !proposed);
    } else {
      setStartDate('');
      setStartTime('');
      setPrice(priceDigits(initialPrice || ''));
      setScope('');
      setEditing(isWorker);
    }
  }, [isOpen, application?.docId, proposed, bothConfirmed, initialPrice, isWorker]);

  if (!isOpen) return null;

  const appId = application?.docId || application?.id;
  const canConfirm =
    !isWorker &&
    proposed &&
    !bothConfirmed &&
    !confirmedByClient;
  const waitingOnHomeowner =
    isWorker &&
    proposed &&
    !bothConfirmed &&
    !confirmedByClient;

  const syncThread = async (agreement) => {
    const threadId = buildThreadId(jobId, resolvedWorkerId);
    if (!threadId || !db) return;
    await setDoc(
      doc(db, 'threads', threadId),
      {
        scheduleAgreement: {
          startDate: agreement.startDate,
          startTime: agreement.startTime,
          price: agreement.price,
          scope: agreement.scope,
          scheduleLabel: agreement.schedule,
          setAt: new Date().toISOString(),
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  };

  const announceScheduleInChat = async () => {
    if (!jobId || !resolvedWorkerId || !resolvedClientId) return;
    await sendMessage({
      jobId,
      workerId: resolvedWorkerId,
      clientId: resolvedClientId,
      jobTitle: resolvedJobTitle,
      authorId: user?.uid || resolvedWorkerId,
      authorName: user?.fullName || application?.workerName || 'Worker',
      authorRole: 'worker',
      text: 'Schedule agreement submitted — open Review schedule to confirm.',
      messageType: 'schedule',
      replaceMessageTypes: ['schedule', 'agreement_confirmed'],
    });
  };

  const announceConfirmationInChat = async () => {
    if (!jobId || !resolvedWorkerId || !resolvedClientId) return;
    await sendMessage({
      jobId,
      workerId: resolvedWorkerId,
      clientId: resolvedClientId,
      jobTitle: resolvedJobTitle,
      authorId: user?.uid || resolvedClientId,
      authorName: user?.fullName || application?.clientName || 'Homeowner',
      authorRole: 'client',
      text: 'Agreement confirmed by the homeowner — booking locked.',
      messageType: 'agreement_confirmed',
      replaceMessageTypes: ['schedule', 'agreement_confirmed'],
    });
  };

  const notifyBothParties = async (agreement) => {
    const eventAt = new Date().toISOString();
    await notifyScheduleProposed({
      workerId: resolvedWorkerId,
      clientId: resolvedClientId,
      jobId,
      jobTitle: resolvedJobTitle,
      scheduleLabel: agreement.schedule,
      price: agreement.price,
      eventAt,
    });
  };

  const notifyConfirmation = async (agreement) => {
    const eventAt = new Date().toISOString();
    const scheduleLabel =
      agreement.schedule ||
      formatScheduledStart(agreement.startDate, agreement.startTime) ||
      null;
    await notifyScheduleConfirmed({
      workerId: resolvedWorkerId,
      clientId: resolvedClientId,
      jobId,
      jobTitle: resolvedJobTitle,
      scheduleLabel,
      price: agreement.price,
      eventAt,
    });
  };

  const validateForm = () => {
    if (!appId) {
      setError('Open chat with an accepted worker first.');
      return false;
    }
    if (!startDate || !startTime) {
      setError('Pick the start date and time.');
      return false;
    }
    if (!priceDigits(price)) {
      setError('Enter the agreed price.');
      return false;
    }
    if (!scope?.trim()) {
      setError('Describe the scope of work.');
      return false;
    }
    return true;
  };

  const handleSendProposalClick = () => {
    if (!isWorker) {
      setError('Only the worker can send a schedule proposal.');
      return;
    }
    setError(null);
    if (!validateForm()) return;
    setAwaitingSendConfirm(true);
  };

  const handlePropose = async () => {
    if (!isWorker) {
      setError('Only the worker can send a schedule proposal.');
      return;
    }
    if (!validateForm()) return;

    const scheduleLabel = formatScheduledStart(startDate, startTime);
    const digits = priceDigits(price);
    const agreement = {
      startDate,
      startTime,
      scheduledStartAt: new Date(`${startDate}T${startTime}`).toISOString(),
      price: formatPriceLabel(digits),
      scope: scope.trim(),
      schedule: scheduleLabel,
    };

    setBusy(true);
    setError(null);
    try {
      await proposeAgreement({
        appId,
        proposerRole: role,
        agreement,
      });
      await syncThread(agreement);
      try {
        await announceScheduleInChat();
      } catch (chatErr) {
        console.warn('Could not post schedule message to chat', chatErr);
      }
      try {
        await notifyBothParties(agreement);
      } catch (notifErr) {
        console.warn('Could not create schedule notifications', notifErr);
      }
      setAwaitingSendConfirm(false);
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Could not save schedule.');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (!appId) return;
    setBusy(true);
    setError(null);
    try {
      await confirmAgreement({ appId, role });
      if (proposed) await syncThread(proposed);
      if (proposed) {
        try {
          await announceConfirmationInChat();
        } catch (chatErr) {
          console.warn('Could not post confirmation message to chat', chatErr);
        }
        try {
          await notifyConfirmation(proposed);
        } catch (notifErr) {
          console.warn('Could not create confirmation notifications', notifErr);
        }
      }
    } catch (err) {
      setError(err.message || 'Could not confirm.');
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
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <HiOutlineCalendarDays className="h-5 w-5 text-[#1F4E79]" aria-hidden="true" />
            <h2 id="schedule-agreement-title" className="text-sm font-semibold text-[#1F4E79]">
              Schedule
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}

          {bothConfirmed && proposed ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <p className="flex items-center gap-2 font-semibold">
                  <HiOutlineCheckBadge className="h-4 w-4" aria-hidden="true" />
                  Both parties confirmed — booking locked
                </p>
                <ul className="mt-2 space-y-1 text-xs text-emerald-800">
                  <li>Start: {proposed.schedule || `${proposed.startDate} ${proposed.startTime}`}</li>
                  <li>Price: {formatPriceLabel(proposed.price)}</li>
                  <li className="whitespace-pre-wrap">Scope: {scopeText(proposed)}</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full cursor-pointer rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Confirm
              </button>
            </div>
          ) : null}

          {!bothConfirmed && proposed && !editing && !awaitingSendConfirm ? (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-[#1F4E79]">
              <p className="font-semibold">
                Latest proposal
                {proposedBy === 'worker'
                  ? isWorker
                    ? ' (from you)'
                    : ' (from worker)'
                  : ''}
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>Start: {proposed.schedule || `${proposed.startDate} ${proposed.startTime}`}</li>
                <li>Price: {formatPriceLabel(proposed.price)}</li>
                <li className="whitespace-pre-wrap">Scope: {scopeText(proposed)}</li>
              </ul>
              <p className="mt-2 text-[11px] text-gray-600">
                {confirmedByWorker ? 'Worker proposed ✓ ' : ''}
                {confirmedByClient ? 'Homeowner confirmed ✓' : 'Waiting for homeowner…'}
              </p>
            </div>
          ) : null}

          {awaitingSendConfirm ? (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-semibold text-amber-950">Confirm this proposal?</p>
              <ul className="space-y-1 text-xs text-amber-900">
                <li>
                  Start: {formatScheduledStart(startDate, startTime) || `${startDate} ${startTime}`}
                </li>
                <li>Price: {formatPriceLabel(price)}</li>
                <li className="whitespace-pre-wrap">Scope: {scope.trim()}</li>
              </ul>
              <p className="rounded-md border border-amber-300/80 bg-white/70 px-2.5 py-2 text-xs text-amber-950">
                Payment stays <span className="font-semibold">off-platform</span> (cash, GCash, or
                bank transfer outside the app). Hire With Ease does not process payments.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setAwaitingSendConfirm(false)}
                  disabled={busy}
                  className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePropose}
                  disabled={busy || !appId}
                  className="w-full cursor-pointer rounded-lg bg-[#1F4E79] py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? 'Sending…' : 'Confirm & send'}
                </button>
              </div>
            </div>
          ) : null}

          {!bothConfirmed && isWorker && editing && !awaitingSendConfirm ? (
            <>
              <div>
                <p className="text-xs font-medium text-gray-600">
                  Start Date &amp; Time <span className="text-red-600">*</span>
                </p>
                <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    type="date"
                    required
                    aria-label="Start date"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <input
                    type="time"
                    required
                    aria-label="Start time"
                    step={900}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>
              <label className="block text-xs font-medium text-gray-600">
                Agreed price <span className="text-red-600">*</span>
                <div className="mt-1 flex items-stretch overflow-hidden rounded-lg border border-gray-300 focus-within:border-[#1F4E79] focus-within:ring-1 focus-within:ring-[#1F4E79]">
                  <span
                    className="flex shrink-0 items-center bg-gray-50 px-3 text-sm font-semibold text-gray-700"
                    aria-hidden="true"
                  >
                    ₱
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    autoComplete="off"
                    className="min-w-0 flex-1 border-0 px-3 py-2 text-sm outline-none"
                    value={price ? Number(price).toLocaleString('en-PH') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, '');
                      setPrice(priceDigits(raw));
                    }}
                    placeholder="1,500"
                    aria-label="Agreed price in pesos"
                  />
                </div>
              </label>
              <label className="block text-xs font-medium text-gray-600">
                Scope of Work <span className="text-red-600">*</span>
                <textarea
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  rows={4}
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="List what's included and what's not included (e.g. Paint all interior walls and ceilings, with the exclusion of doors and floors)."
                />
              </label>
            </>
          ) : null}

          <div className="flex flex-col gap-2">
            {!bothConfirmed && isWorker && editing && !awaitingSendConfirm ? (
              <button
                type="button"
                onClick={handleSendProposalClick}
                disabled={busy || !appId}
                className="w-full cursor-pointer rounded-lg bg-[#1F4E79] py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {proposed ? 'Send counter-proposal' : 'Send proposal'}
              </button>
            ) : null}
            {!bothConfirmed && isWorker && proposed && !editing && !awaitingSendConfirm ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="w-full cursor-pointer rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Counter-propose
              </button>
            ) : null}
            {canConfirm && !awaitingSendConfirm ? (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={busy}
                className="w-full cursor-pointer rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Confirming…' : 'Confirm schedule'}
              </button>
            ) : null}
          </div>

          {waitingOnHomeowner && !awaitingSendConfirm ? (
            <p className="text-[11px] text-gray-500">
              Waiting for the homeowner to review and confirm…
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ScheduleAgreementModal;
