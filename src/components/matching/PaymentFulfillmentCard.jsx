import { useState } from 'react';
import {
  HiOutlineBanknotes,
  HiOutlineBuildingLibrary,
  HiOutlineCheckBadge,
  HiOutlineDevicePhoneMobile,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import {
  acknowledgePayment,
  counterPaymentClaim,
} from '../../lib/matching/agreements.js';

const METHODS = [
  {
    id: 'Cash on site',
    label: 'Cash',
    icon: HiOutlineBanknotes,
  },
  {
    id: 'GCash (off-platform)',
    label: 'E-Wallet',
    icon: HiOutlineDevicePhoneMobile,
  },
  {
    id: 'Bank transfer (off-platform)',
    label: 'Bank',
    icon: HiOutlineBuildingLibrary,
  },
];

function methodMeta(methodId) {
  return METHODS.find((m) => m.id === methodId) || null;
}

function ClaimedMethodRow({ meta, methodId }) {
  const Icon = meta.icon;
  return (
    <>
      <Icon className="h-5 w-5 text-[#1F4E79]" aria-hidden="true" />
      <span className="font-semibold">{meta.label}</span>
      <span className="text-gray-500">({methodId})</span>
    </>
  );
}

function agreedAmountLabel(application) {
  const price =
    application?.proposedAgreement?.price ||
    application?.agreement?.price ||
    null;
  if (!price) return 'Agreed amount';
  return String(price).trim();
}

/**
 * Off-platform payment record.
 * Homeowner declares method; worker sees amount + mode and confirms or counters.
 */
function PaymentFulfillmentCard({ application, role }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState(METHODS[0].id);
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterNote, setCounterNote] = useState('');

  if (!application) return null;

  const isClient = role === 'client';
  const isWorker = role === 'worker';
  const clientOk = !!application.paymentAcknowledgedByClient;
  const workerOk = !!application.paymentAcknowledgedByWorker;
  const bothOk = clientOk && workerOk;
  const countered = !!application.paymentCounteredByWorker && !clientOk;
  const claimedMethod = application.paymentMethodNote || null;
  const claimedMeta = methodMeta(claimedMethod);
  const amountLabel = agreedAmountLabel(application);

  const handleClientAck = async () => {
    setBusy(true);
    setError(null);
    try {
      await acknowledgePayment({
        appId: application.docId || application.id,
        role: 'client',
        methodNote: method,
      });
    } catch (err) {
      setError(err.message || 'Could not save acknowledgment.');
    } finally {
      setBusy(false);
    }
  };

  const handleWorkerAck = async () => {
    setBusy(true);
    setError(null);
    try {
      await acknowledgePayment({
        appId: application.docId || application.id,
        role: 'worker',
      });
    } catch (err) {
      setError(err.message || 'Could not save acknowledgment.');
    } finally {
      setBusy(false);
    }
  };

  const handleCounter = async () => {
    setBusy(true);
    setError(null);
    try {
      await counterPaymentClaim({
        appId: application.docId || application.id,
        note: counterNote.trim() || 'Payment amount or mode does not match what I received.',
      });
      setCounterOpen(false);
      setCounterNote('');
    } catch (err) {
      setError(err.message || 'Could not send counter.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-amber-300/60 bg-white/95 shadow-sm">
      <header className="px-4 pb-1 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
          Payment (off-platform)
        </p>
        <h3 className="mt-0.5 text-sm font-semibold text-[#1F4E79]">
          {bothOk
            ? 'Payment confirmed by both parties'
            : isWorker
              ? clientOk
                ? 'Review homeowner payment claim'
                : 'Waiting for homeowner payment record'
              : countered
                ? 'Worker countered — record payment again'
                : 'Confirm cash / off-platform payment'}
        </h3>
      </header>

      <div className="space-y-4 px-4 pb-4 pt-2 text-sm">
        <p className="text-xs leading-relaxed text-gray-600">
          Hire With Ease does <span className="font-semibold">not</span> process payments, hold
          escrow, or issue refunds. This only records that you settled outside the app. The
          homeowner declares how they paid; the worker confirms or counters that claim.
        </p>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}

        {bothOk ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <p className="flex items-center gap-2 font-semibold">
              <HiOutlineCheckBadge className="h-4 w-4 shrink-0" aria-hidden="true" />
              Deal payment recorded
            </p>
            <p className="mt-1.5 text-emerald-800/90">
              Amount: {amountLabel}
              {claimedMeta || claimedMethod
                ? ` · Mode: ${claimedMeta?.label || claimedMethod}`
                : ''}
            </p>
          </div>
        ) : null}

        {/* Homeowner: pick mode + declare paid */}
        {isClient && !bothOk ? (
          <>
            {countered ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                <p className="flex items-start gap-2 font-semibold">
                  <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  Worker countered your payment claim
                </p>
                {application.paymentCounterNote ? (
                  <p className="mt-1.5 text-amber-900/90">{application.paymentCounterNote}</p>
                ) : null}
                <p className="mt-1.5">Choose the mode again and re-confirm when you have settled.</p>
              </div>
            ) : null}

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-xs text-gray-700">
              <p className="font-medium text-gray-500">Agreed amount</p>
              <p className="mt-0.5 text-sm font-semibold text-[#1F4E79]">{amountLabel}</p>
            </div>

            {!clientOk ? (
              <div>
                <p className="text-xs font-medium text-gray-700">How did you pay?</p>
                <div
                  className="mt-2 grid grid-cols-3 gap-2"
                  role="radiogroup"
                  aria-label="Payment method"
                >
                  {METHODS.map(({ id, label, icon: Icon }) => {
                    const selected = method === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setMethod(id)}
                        className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition ${
                          selected
                            ? 'border-[#1F4E79] bg-[#1F4E79]/5 text-[#1F4E79] ring-2 ring-[#1F4E79]/20'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white'
                        }`}
                      >
                        <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        <span className="text-[11px] font-semibold leading-none">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 text-xs text-emerald-900">
                <p className="font-semibold">You recorded payment</p>
                <p className="mt-1">
                  {amountLabel}
                  {claimedMeta || claimedMethod
                    ? ` · ${claimedMeta?.label || claimedMethod}`
                    : ''}
                </p>
                <p className="mt-1.5 text-emerald-800/80">Waiting for the worker to confirm…</p>
              </div>
            )}

            {!clientOk ? (
              <button
                type="button"
                onClick={handleClientAck}
                disabled={busy}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-[#1F4E79] hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HiOutlineBanknotes className="h-4 w-4" aria-hidden="true" />
                {busy ? 'Saving…' : 'I paid the agreed amount'}
              </button>
            ) : null}
          </>
        ) : null}

        {/* Worker: informed only; confirm or counter */}
        {isWorker && !bothOk ? (
          <>
            {!clientOk ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-xs text-gray-600">
                <p>
                  Waiting for the homeowner to record that they paid the agreed amount and how
                  (Cash, E-Wallet, or Bank).
                </p>
                <p className="mt-2 font-medium text-[#1F4E79]">Agreed amount: {amountLabel}</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-[#1F4E79]/15 bg-[#1F4E79]/5 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1F4E79]/70">
                    Homeowner claims
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#1F4E79]">
                    Amount: {amountLabel}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                    {claimedMeta ? (
                      <ClaimedMethodRow meta={claimedMeta} methodId={claimedMethod} />
                    ) : (
                      <span className="font-semibold">{claimedMethod || '—'}</span>
                    )}
                  </div>
                </div>

                {!workerOk && !counterOpen ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleWorkerAck}
                      disabled={busy}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-[#1F4E79] hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <HiOutlineCheckBadge className="h-4 w-4" aria-hidden="true" />
                      {busy ? 'Saving…' : 'I received this'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCounterOpen(true)}
                      disabled={busy}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <HiOutlineExclamationTriangle className="h-4 w-4" aria-hidden="true" />
                      Counter this claim
                    </button>
                  </div>
                ) : null}

                {counterOpen ? (
                  <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-semibold text-amber-950">
                      Why are you countering? (homeowner will see this)
                    </p>
                    <textarea
                      value={counterNote}
                      onChange={(e) => setCounterNote(e.target.value)}
                      rows={3}
                      maxLength={280}
                      placeholder="e.g. Amount is wrong, or I was paid by a different method…"
                      className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleCounter}
                        disabled={busy}
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
                      >
                        {busy ? 'Sending…' : 'Send counter'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCounterOpen(false);
                          setCounterNote('');
                        }}
                        disabled={busy}
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}

export default PaymentFulfillmentCard;
