import { useEffect, useState } from 'react';
import { HiOutlineCheckBadge, HiOutlinePencilSquare } from 'react-icons/hi2';
import {
  confirmAgreement,
  proposeAgreement,
} from '../../lib/matching/agreements.js';

/**
 * Inline propose-and-confirm Agreement workflow that appears alongside
 * the chat panel during negotiation.
 *
 * Both client and worker see the same data, but actions differ:
 *   - Either side can Propose / Counter-propose price/schedule/scope.
 *   - The OTHER side then sees a Confirm button.
 *   - When both sides have confirmed, the parent page reflects the
 *     `Confirmed` job status (handled in agreements.js).
 *
 * Props:
 *   - application -- live Firestore application doc
 *   - role        -- 'client' | 'worker'
 *   - jobBudget   -- string used as the initial proposal price hint
 */
function AgreementCard({ application, role, jobBudget }) {
  const [editing, setEditing] = useState(!application?.proposedAgreement);
  const [form, setForm] = useState({
    price: application?.proposedAgreement?.price || jobBudget || '',
    schedule: application?.proposedAgreement?.schedule || '',
    scope: application?.proposedAgreement?.scope || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm({
      price: application?.proposedAgreement?.price || jobBudget || '',
      schedule: application?.proposedAgreement?.schedule || '',
      scope: application?.proposedAgreement?.scope || '',
    });
    setEditing(!application?.proposedAgreement);
    setError(null);
  }, [application?.docId, application?.proposedAgreement, jobBudget]);

  if (!application) return null;

  const proposed = application.proposedAgreement;
  const proposedBy = application.proposedBy;
  const confirmedByClient = !!application.confirmedByClient;
  const confirmedByWorker = !!application.confirmedByWorker;
  const bothConfirmed = confirmedByClient && confirmedByWorker;
  const otherSide = role === 'client' ? 'worker' : 'client';
  const waitingOnOtherSide =
    proposed && (
      (role === 'client' && proposedBy === 'client' && !confirmedByWorker) ||
      (role === 'worker' && proposedBy === 'worker' && !confirmedByClient)
    );
  const canConfirm =
    proposed && (
      (role === 'client' && proposedBy === 'worker' && !confirmedByClient) ||
      (role === 'worker' && proposedBy === 'client' && !confirmedByWorker)
    );

  const handlePropose = async () => {
    setBusy(true);
    setError(null);
    try {
      await proposeAgreement({
        appId: application.docId || application.id,
        proposerRole: role,
        agreement: {
          price: form.price,
          schedule: form.schedule,
          scope: form.scope,
        },
      });
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Could not save proposal.');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await confirmAgreement({
        appId: application.docId || application.id,
        role,
      });
    } catch (err) {
      setError(err.message || 'Could not confirm.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <header className="border-b border-gray-100 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Final agreement
        </p>
        <h3 className="text-sm font-semibold text-[#1F4E79]">
          {bothConfirmed
            ? 'Booking confirmed'
            : proposed
              ? `Proposed by ${proposedBy === role ? 'you' : otherSide}`
              : 'Propose price, schedule, and scope'}
        </h3>
      </header>

      <div className="space-y-3 p-4">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        {bothConfirmed ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <p className="flex items-center gap-2 font-semibold">
              <HiOutlineCheckBadge className="h-4 w-4" aria-hidden="true" />
              Both parties have agreed. The job is locked.
            </p>
            <ul className="mt-1 space-y-0.5 text-xs text-emerald-800">
              <li>Final price: {proposed.price || '—'}</li>
              <li>Schedule: {proposed.schedule || '—'}</li>
              <li>Scope: {proposed.scope || '—'}</li>
            </ul>
          </div>
        ) : null}

        {!bothConfirmed && proposed && !editing ? (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-[#1F4E79]">
            <p className="font-semibold">Latest proposal</p>
            <ul className="mt-1 space-y-0.5 text-xs">
              <li>Price: {proposed.price || '—'}</li>
              <li>Schedule: {proposed.schedule || '—'}</li>
              <li>Scope: {proposed.scope || '—'}</li>
            </ul>
            <p className="mt-2 text-[11px] text-gray-600">
              {confirmedByClient ? 'Client confirmed ✓ ' : ''}
              {confirmedByWorker ? 'Worker confirmed ✓' : ''}
            </p>
          </div>
        ) : null}

        {editing ? (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">
              Final price
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={form.price}
                onChange={(e) =>
                  setForm((p) => ({ ...p, price: e.target.value }))
                }
                placeholder="e.g. PHP 2,000"
              />
            </label>
            <label className="block text-xs font-medium text-gray-600">
              Final schedule
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={form.schedule}
                onChange={(e) =>
                  setForm((p) => ({ ...p, schedule: e.target.value }))
                }
                placeholder="e.g. Apr 30, 2026 · 9:00 AM"
              />
            </label>
            <label className="block text-xs font-medium text-gray-600">
              Scope of work
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                rows={3}
                value={form.scope}
                onChange={(e) =>
                  setForm((p) => ({ ...p, scope: e.target.value }))
                }
                placeholder="What is included / not included"
              />
            </label>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {!bothConfirmed && editing ? (
            <button
              type="button"
              onClick={handlePropose}
              disabled={busy}
              className="rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {proposed ? 'Send counter-proposal' : 'Send proposal'}
            </button>
          ) : null}
          {!bothConfirmed && proposed && !editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" />
              Counter-propose
            </button>
          ) : null}
          {canConfirm ? (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Confirm agreement
            </button>
          ) : null}
        </div>

        {waitingOnOtherSide ? (
          <p className="text-[11px] text-gray-500">
            Waiting for the {otherSide} to review and confirm…
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default AgreementCard;
