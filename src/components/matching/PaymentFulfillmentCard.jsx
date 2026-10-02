import { useState } from 'react';
import { HiOutlineBanknotes, HiOutlineCheckBadge } from 'react-icons/hi2';
import { acknowledgePayment } from '../../lib/matching/agreements.js';

const METHODS = ['Cash on site', 'GCash (off-platform)', 'Bank transfer (off-platform)'];

/**
 * Mutual ack that cash/off-platform payment happened. Not a payment gateway.
 */
function PaymentFulfillmentCard({ application, role }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState(
    application?.paymentMethodNote || METHODS[0],
  );

  if (!application) return null;

  const clientOk = !!application.paymentAcknowledgedByClient;
  const workerOk = !!application.paymentAcknowledgedByWorker;
  const bothOk = clientOk && workerOk;
  const iAcked = role === 'client' ? clientOk : workerOk;

  const handleAck = async () => {
    setBusy(true);
    setError(null);
    try {
      await acknowledgePayment({
        appId: application.docId || application.id,
        role,
        methodNote: method,
      });
    } catch (err) {
      setError(err.message || 'Could not save acknowledgment.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-amber-300/60 bg-white/95 shadow-sm">
      <header className="border-b border-amber-100 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
          Payment (off-platform)
        </p>
        <h3 className="text-sm font-semibold text-[#1F4E79]">
          {bothOk ? 'Payment confirmed by both parties' : 'Confirm cash / off-platform payment'}
        </h3>
      </header>
      <div className="space-y-3 p-4 text-sm">
        <p className="text-xs text-gray-600">
          Hire With Ease does <span className="font-semibold">not</span> process payments or hold
          escrow. Use this only to record that you settled the agreed amount outside the app.
        </p>
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}
        {bothOk ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <p className="flex items-center gap-2 font-semibold">
              <HiOutlineCheckBadge className="h-4 w-4" aria-hidden="true" />
              Deal payment recorded
            </p>
            <p className="mt-1">Method: {application.paymentMethodNote || method}</p>
          </div>
        ) : (
          <>
            <label className="block text-xs font-medium text-gray-600">
              How was payment made?
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                disabled={iAcked}
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <ul className="space-y-0.5 text-[11px] text-gray-600">
              <li>Homeowner paid: {clientOk ? '✓' : '—'}</li>
              <li>Worker received: {workerOk ? '✓' : '—'}</li>
            </ul>
            {!iAcked ? (
              <button
                type="button"
                onClick={handleAck}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-[#1F4E79] disabled:opacity-60"
              >
                <HiOutlineBanknotes className="h-4 w-4" aria-hidden="true" />
                {busy
                  ? 'Saving…'
                  : role === 'client'
                    ? 'I paid the agreed amount'
                    : 'I received the payment'}
              </button>
            ) : (
              <p className="text-xs font-medium text-emerald-800">
                You confirmed. Waiting for the other party…
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default PaymentFulfillmentCard;
