import { useMemo, useState } from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineIdentification,
  HiOutlineShieldCheck,
  HiOutlineUserCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import PageHeader from '../../components/PageHeader.jsx';
import TrustBadge from '../../components/TrustBadge.jsx';
import { useVerification } from '../../context/VerificationContext.jsx';
import clientsSeed from '../../data/clients.js';
import workersSeed from '../../data/applicants.js';
import { getTrustTier } from '../../utils/trust.js';

const REVIEWER = 'Maria Cruz (PESO)';

/* -------------------------------------------------------------------------- */
/*  Lookup helpers                                                             */
/* -------------------------------------------------------------------------- */

const workersById = new Map(workersSeed.map((w) => [w.id, w]));
const clientsById = new Map(clientsSeed.map((c) => [c.id, c]));

function getProfile(id) {
  if (id.startsWith('wrk-')) {
    const w = workersById.get(id);
    if (w) {
      return {
        name: w.name,
        subtitle: `${w.skills?.slice(0, 2).join(', ')} · ${w.location}`,
        role: 'service-provider',
      };
    }
  }
  if (id.startsWith('clt-')) {
    const c = clientsById.get(id);
    if (c) {
      return {
        name: c.name,
        subtitle: `${c.type === 'business' ? 'Business' : 'Individual'} · ${c.location}`,
        role: 'client',
      };
    }
  }
  return { name: id, subtitle: '', role: 'service-provider' };
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

const TABS = [
  { key: 'identity', label: 'Identity Review', icon: HiOutlineIdentification },
  { key: 'documents', label: 'Document Review', icon: HiOutlineDocumentText },
  { key: 'activation', label: 'Activation', icon: HiOutlineShieldCheck },
];

function AdminVerificationPage() {
  const {
    pendingIdentityReviews,
    pendingDocumentReviews,
    pendingActivations,
    reviewIdentity,
    reviewDocument,
    setActivation,
  } = useVerification();

  const [tab, setTab] = useState('identity');

  const counts = useMemo(
    () => ({
      identity: pendingIdentityReviews.length,
      documents: pendingDocumentReviews.length,
      activation: pendingActivations.length,
    }),
    [pendingIdentityReviews, pendingDocumentReviews, pendingActivations]
  );

  return (
    <div>
      <PageHeader
        title="Verification Queue"
        subtitle="Review identity submissions, supporting documents, and activate trusted service providers."
      />

      <div
        role="tablist"
        className="mb-4 flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-white p-1 shadow-sm sm:inline-flex"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          const count = counts[t.key];
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition cursor-pointer ${
                active
                  ? 'bg-[#1F4E79] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <t.icon className="h-4 w-4" aria-hidden="true" />
              {t.label}
              <span
                className={`inline-flex min-w-[1.5rem] justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === 'identity' ? (
        <IdentityQueue
          items={pendingIdentityReviews}
          onApprove={(id, note) =>
            reviewIdentity(id, { approve: true, reviewer: REVIEWER, note })
          }
          onReject={(id, note) =>
            reviewIdentity(id, { approve: false, reviewer: REVIEWER, note })
          }
        />
      ) : null}

      {tab === 'documents' ? (
        <DocumentQueue
          items={pendingDocumentReviews}
          onApprove={(id, docIndex, note) =>
            reviewDocument(id, { docIndex, approve: true, note })
          }
          onReject={(id, docIndex, note) =>
            reviewDocument(id, { docIndex, approve: false, note })
          }
        />
      ) : null}

      {tab === 'activation' ? (
        <ActivationQueue
          items={pendingActivations}
          onActivate={(id) => setActivation(id, { active: true, by: REVIEWER })}
        />
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Queue sections                                                             */
/* -------------------------------------------------------------------------- */

function EmptyState({ title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
      <HiOutlineCheckCircle className="h-8 w-8 text-emerald-500" aria-hidden="true" />
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      {hint ? <p className="max-w-sm text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

function PreviewImage({ src, label, fallbackIcon }) {
  const Icon = fallbackIcon || HiOutlineUserCircle;
  if (!src) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
        <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
        <span>{label}</span>
        <span className="text-[10px] text-gray-400">(seed record · no file)</span>
      </div>
    );
  }
  const isImage = src.startsWith('data:image') || /^https?:/i.test(src);
  if (!isImage) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-[#1F4E79] underline"
      >
        <HiOutlineDocumentText className="h-4 w-4" aria-hidden="true" />
        Open {label}
      </a>
    );
  }
  return (
    <figure className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      <img src={src} alt={label} className="max-h-48 w-full object-contain" />
      <figcaption className="px-2 py-1 text-[10px] uppercase tracking-wide text-gray-500">
        {label}
      </figcaption>
    </figure>
  );
}

function ReviewCard({ children, header }) {
  return (
    <article className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      {header}
      {children}
    </article>
  );
}

function ApproveRejectActions({ onApprove, onReject }) {
  const [note, setNote] = useState('');
  return (
    <div className="mt-4 space-y-2">
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note (shown on rejection / kept on approval)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onReject(note || 'Needs resubmission.')}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-100"
        >
          <HiOutlineXCircle className="h-4 w-4" aria-hidden="true" />
          Reject
        </button>
        <button
          type="button"
          onClick={() => onApprove(note)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1F4E79] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
        >
          <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
          Approve
        </button>
      </div>
    </div>
  );
}

/* --------------------------- Identity queue ------------------------------- */

function IdentityQueue({ items, onApprove, onReject }) {
  if (!items.length) {
    return (
      <EmptyState
        title="Identity queue is clear"
        hint="New identity submissions from applicants and clients will appear here for review."
      />
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(({ id, record }) => {
        const profile = getProfile(id);
        return (
          <ReviewCard
            key={id}
            header={
              <header className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Pending review
                  </p>
                  <h3 className="mt-0.5 text-base font-semibold text-gray-900">
                    {profile.name}
                  </h3>
                  <p className="text-xs text-gray-500">{profile.subtitle}</p>
                </div>
                <TrustBadge tier={getTrustTier(record, profile.role)} size="sm" />
              </header>
            }
          >
            <dl className="mt-3 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <dt>ID submitted</dt>
                <dd className="font-medium text-gray-800">
                  {formatDate(record.stage2?.idSubmittedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Mobile confirmed</dt>
                <dd className="font-medium text-gray-800">
                  {record.stage1?.mobile || '—'}
                </dd>
              </div>
            </dl>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <PreviewImage
                src={record.stage2?.idImage}
                label="Government ID"
                fallbackIcon={HiOutlineIdentification}
              />
              <PreviewImage
                src={record.stage2?.selfieImage}
                label="Selfie w/ ID"
                fallbackIcon={HiOutlineUserCircle}
              />
            </div>

            <ApproveRejectActions
              onApprove={(note) => onApprove(id, note)}
              onReject={(note) => onReject(id, note)}
            />
          </ReviewCard>
        );
      })}
    </div>
  );
}

/* --------------------------- Document queue ------------------------------- */

function DocumentQueue({ items, onApprove, onReject }) {
  if (!items.length) {
    return (
      <EmptyState
        title="No supporting documents waiting"
        hint="Barangay clearances, TESDA certificates, and other uploads appear here once submitted."
      />
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(({ id, record, document, docIndex }) => {
        const profile = getProfile(id);
        return (
          <ReviewCard
            key={`${id}-${docIndex}`}
            header={
              <header className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    {document.label}
                  </p>
                  <h3 className="mt-0.5 text-base font-semibold text-gray-900">
                    {profile.name}
                  </h3>
                  <p className="text-xs text-gray-500">{profile.subtitle}</p>
                </div>
                <TrustBadge tier={getTrustTier(record, profile.role)} size="sm" />
              </header>
            }
          >
            <dl className="mt-3 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <dt>Submitted</dt>
                <dd className="font-medium text-gray-800">
                  {formatDate(document.submittedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Document type</dt>
                <dd className="font-medium text-gray-800">
                  {document.type}
                </dd>
              </div>
            </dl>

            <div className="mt-3">
              <PreviewImage
                src={document.fileData}
                label={document.label}
                fallbackIcon={HiOutlineDocumentText}
              />
            </div>

            <ApproveRejectActions
              onApprove={(note) => onApprove(id, docIndex, note)}
              onReject={(note) =>
                onReject(id, docIndex, note || 'Please resubmit a clearer copy.')
              }
            />
          </ReviewCard>
        );
      })}
    </div>
  );
}

/* --------------------------- Activation queue ----------------------------- */

function ActivationQueue({ items, onActivate }) {
  if (!items.length) {
    return (
      <EmptyState
        title="No-one waiting for activation"
        hint="Once an applicant passes identity review, they appear here for final PESO activation."
      />
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(({ id, record }) => {
        const profile = getProfile(id);
        return (
          <ReviewCard
            key={id}
            header={
              <header className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                    Ready to activate
                  </p>
                  <h3 className="mt-0.5 text-base font-semibold text-gray-900">
                    {profile.name}
                  </h3>
                  <p className="text-xs text-gray-500">{profile.subtitle}</p>
                </div>
                <TrustBadge tier={getTrustTier(record, profile.role)} size="sm" />
              </header>
            }
          >
            <dl className="mt-3 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <dt>Phone confirmed</dt>
                <dd className="font-medium text-gray-800">
                  {formatDate(record.stage1?.otpVerifiedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Identity approved</dt>
                <dd className="font-medium text-gray-800">
                  {formatDate(record.stage2?.reviewedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Documents on file</dt>
                <dd className="font-medium text-gray-800">
                  {(record.stage3?.documents || []).length}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => onActivate(id)}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#1F4E79] px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110"
              >
                <HiOutlineShieldCheck className="h-4 w-4" aria-hidden="true" />
                Activate service provider
              </button>
              <p className="mt-2 flex items-start gap-1 text-[11px] text-gray-500">
                <HiOutlineExclamationTriangle
                  className="mt-0.5 h-3 w-3 shrink-0 text-amber-500"
                  aria-hidden="true"
                />
                Activation marks this account as fully verified and eligible for
                matching.
              </p>
            </div>
          </ReviewCard>
        );
      })}
    </div>
  );
}

export default AdminVerificationPage;
