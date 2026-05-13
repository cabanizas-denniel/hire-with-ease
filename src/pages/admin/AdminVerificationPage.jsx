import { useEffect, useMemo, useState } from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineUserCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import PageHeader from '../../components/PageHeader.jsx';
import TrustBadge from '../../components/TrustBadge.jsx';
import ModalShell from '../../components/verification/ModalShell.jsx';
import { useVerification } from '../../context/VerificationContext.jsx';
import { getTrustTier } from '../../utils/trust.js';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import { isPdfLike } from '../../lib/verificationUploads.js';

const REVIEWER = 'Maria Cruz (PESO)';
const PAGE_SIZE = 10;

/* -------------------------------------------------------------------------- */
/*  Lookup helpers                                                             */
/* -------------------------------------------------------------------------- */

function toProfile(userId, userDoc) {
  const firestoreRole = userDoc?.role || null;
  const role = firestoreRole === 'homeowner' ? 'client' : 'service-provider';
  const name = userDoc?.fullName || userDoc?.email || userId;
  const subtitle =
    role === 'client'
      ? `Employer · ${userDoc?.email || ''}`.trim()
      : `Worker · ${userDoc?.email || ''}`.trim();
  return { name, subtitle, role };
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

function safeTime(iso) {
  const t = new Date(iso || 0).getTime();
  return Number.isFinite(t) ? t : 0;
}

function latestSubmissionAt(record) {
  const idAt = safeTime(record?.stage2?.idSubmittedAt);
  const docs = record?.stage3?.documents || [];
  const latestDocAt = docs.reduce((acc, d) => Math.max(acc, safeTime(d?.submittedAt)), 0);
  const activationAt = safeTime(record?.stage2?.reviewedAt);
  return Math.max(idAt, latestDocAt, activationAt);
}

function isDocPending(doc) {
  if (!doc) return false;
  if (doc.reviewStatus) return doc.reviewStatus === 'pending';
  // Legacy docs used boolean `reviewed` only.
  if (typeof doc.reviewed === 'boolean') return doc.reviewed === false;
  return false;
}

function PaginationBar({ page, totalPages, totalItems, onPrev, onNext }) {
  const from = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalItems);
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-sm">
      <p className="text-xs font-medium text-gray-600">
        Showing{' '}
        <span className="font-semibold text-gray-900">{from}</span>
        {' '}–{' '}
        <span className="font-semibold text-gray-900">{to}</span>
        {' '}of{' '}
        <span className="font-semibold text-gray-900">{totalItems}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="inline-flex min-h-[36px] items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-xs text-gray-600">
          Page <span className="font-semibold text-gray-900">{page}</span> / {totalPages}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="inline-flex min-h-[36px] items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

const TABS = [
  { key: 'employers', label: 'Employers', icon: HiOutlineUserCircle },
  { key: 'workers', label: 'Workers', icon: HiOutlineShieldCheck },
];

function AdminVerificationPage() {
  const {
    records,
    reviewIdentity,
    reviewDocument,
    rejectApplication,
    setActivation,
  } = useVerification();

  const [usersById, setUsersById] = useState({});
  useEffect(() => {
    if (!db) return () => {};
    const q = query(collection(db, 'users'));
    return onSnapshot(
      q,
      (snap) => {
        const next = {};
        snap.docs.forEach((d) => {
          next[d.id] = d.data();
        });
        setUsersById(next);
      },
      () => setUsersById({})
    );
  }, []);

  const [tab, setTab] = useState('workers');
  const [sort, setSort] = useState({ key: 'latest', dir: 'desc' });
  const [pageByTab, setPageByTab] = useState({ employers: 1, workers: 1 });

  const counts = useMemo(() => {
    const base = { employers: 0, workers: 0 };
    Object.entries(records || {}).forEach(([id, rec]) => {
      const profile = toProfile(id, usersById[id]);
      const isWorker = profile.role === 'service-provider';
      const hasPendingIdentity = rec?.stage2?.reviewStatus === 'pending';
      const hasPendingDocs = (rec?.stage3?.documents || []).some((d) => isDocPending(d));
      const hasPendingActivation =
        isWorker && rec?.stage2?.reviewStatus === 'reviewed' && !rec?.stage4?.activatedAt;
      if (hasPendingIdentity || hasPendingDocs || hasPendingActivation) {
        if (isWorker) base.workers += 1;
        else base.employers += 1;
      }
    });
    return base;
  }, [records, usersById]);

  const sortOptions = useMemo(
    () => [
      { value: 'latest', label: 'Latest activity' },
      { value: 'name', label: 'Name' },
    ],
    []
  );

  useEffect(() => {
    setPageByTab((prev) => ({ ...prev, [tab]: 1 }));
  }, [tab, sort.key, sort.dir]);

  return (
    <div>
      <PageHeader
        title="Verification Queue"
        subtitle="Review identity and supporting documents. Worker activation is bundled on the same card."
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

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Sort by
          </span>
          <select
            value={sort.key}
            onChange={(e) => setSort((prev) => ({ ...prev, key: e.target.value }))}
            className="min-h-[36px] rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSort((prev) => ({ ...prev, dir: prev.dir === 'asc' ? 'desc' : 'asc' }))}
            className="inline-flex min-h-[36px] items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            {sort.dir === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Limit: <span className="font-semibold text-gray-700">{PAGE_SIZE}</span> per page
        </p>
      </div>

      <SubmissionQueue
        tab={tab}
        usersById={usersById}
        records={records}
        sort={sort}
        page={pageByTab[tab]}
        setPage={(p) => setPageByTab((prev) => ({ ...prev, [tab]: p }))}
        onApproveIdentity={(id, note) => reviewIdentity(id, { approve: true, reviewer: REVIEWER, note })}
        onRejectApplication={(id, note) => rejectApplication(id, { reviewer: REVIEWER, note })}
        onApproveDoc={(id, docIndex, note) => reviewDocument(id, { docIndex, approve: true, reviewer: REVIEWER, note })}
        onActivate={(id) => setActivation(id, { active: true, by: REVIEWER })}
      />
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
  const [open, setOpen] = useState(false);
  if (!src) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
        <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
        <span>{label}</span>
        <span className="text-[10px] text-gray-400">(seed record · no file)</span>
      </div>
    );
  }
  const isPdf = isPdfLike({ url: src, dataUrl: src });
  const isImage = !isPdf && (src.startsWith('data:image') || (src.startsWith('http') && !src.toLowerCase().includes('.pdf')));
  if (isPdf) {
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

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-left cursor-zoom-in"
        aria-label={`Open ${label}`}
      >
        <img
          src={src}
          alt={label}
          className="max-h-48 w-full object-contain transition group-hover:brightness-95"
          loading="lazy"
        />
        <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-gray-500">
          {label}
        </div>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative w-full max-w-5xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-3 right-0 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow cursor-pointer"
            >
              <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
              Close
            </button>
            <img
              src={src}
              alt={label}
              className="max-h-[85vh] w-full rounded-xl bg-white object-contain"
            />
            <p className="mt-2 text-center text-xs text-white/80">{label}</p>
          </div>
        </div>
      ) : null}
    </>
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

function RejectVerificationModal({ isOpen, onClose, userId, onRejectApplication }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setNote('');
    setError('');
  }, [isOpen]);

  const runReject = async () => {
    setBusy(true);
    setError('');
    try {
      await onRejectApplication(userId, note);
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not save rejection. Check rules/permissions and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      title="Reject application"
      subtitle="Any pending identity and all documents still under review will be returned to the applicant with this note."
 
      onClose={busy ? undefined : onClose}
      footer={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="min-h-[40px] flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => runReject()}
            className="min-h-[40px] flex-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 shadow-sm hover:bg-red-100 disabled:opacity-50 cursor-pointer"
          >
            {busy ? 'Saving…' : 'Confirm reject'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="reject-note" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Optional note
          </label>
          <input
            id="reject-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={busy}
            placeholder="Shown on every rejected item for this applicant"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
          />
        </div>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        ) : null}
      </div>
    </ModalShell>
  );
}

function ApproveActivationModal({
  isOpen,
  onClose,
  isWorker,
  hasPendingIdentity,
  pendingDocs,
  canActivateWorker,
  onApproveIdentity,
  onApproveDoc,
  onActivate,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const docCount = pendingDocs?.length ?? 0;
  const needsApproval = hasPendingIdentity || docCount > 0;
  const workerShouldActivate = Boolean(canActivateWorker);
  const confirmLabel = workerShouldActivate ? 'Activate' : 'Approve';

  useEffect(() => {
    if (!isOpen) return;
    setError('');
  }, [isOpen]);

  const runApprove = async () => {
    setBusy(true);
    setError('');
    try {
      if (needsApproval) {
        if (hasPendingIdentity) await onApproveIdentity('');
        for (const { docIndex } of pendingDocs || []) {
          await onApproveDoc(docIndex, '');
        }
      }
      if (workerShouldActivate) await onActivate();
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not complete approval. Check rules/permissions and try again.');
    } finally {
      setBusy(false);
    }
  };

  const title = workerShouldActivate ? 'Approve and activate?' : 'Approve submission?';

  return (
    <ModalShell
      isOpen={isOpen}
      title={title}
      subtitle={isWorker && workerShouldActivate ? 'Approve pending items (if any), then activate for matching.' : undefined}
      onClose={busy ? undefined : onClose}
      footer={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="min-h-[40px] flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => runApprove()}
            className="min-h-[40px] flex-1 rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-50 cursor-pointer"
          >
            {busy ? 'Saving…' : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {needsApproval ? (
          <p className="text-sm text-gray-700">
            Pending to approve:
            {hasPendingIdentity ? <span className="font-medium text-gray-900"> identity review</span> : null}
            {hasPendingIdentity && docCount > 0 ? <span className="text-gray-600"> and </span> : null}
            {docCount > 0 ? (
              <span className="font-medium text-gray-900">
                {docCount} supporting document{docCount === 1 ? '' : 's'}
              </span>
            ) : null}
            .
          </p>
        ) : (
          <p className="text-sm text-gray-700">
            Identity is already approved. You are about to activate this worker account for matching.
          </p>
        )}

        {workerShouldActivate ? (
          <p className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <span>
              Activation marks this account as fully verified and eligible for matching. This cannot be undone from this screen without another admin workflow.
            </span>
          </p>
        ) : null}

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        ) : null}
      </div>
    </ModalShell>
  );
}

function SubmissionQueue({
  tab,
  usersById,
  records,
  sort,
  page,
  setPage,
  onApproveIdentity,
  onRejectApplication,
  onApproveDoc,
  onActivate,
}) {
  const [rejectUserId, setRejectUserId] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);

  const items = useMemo(() => {
    const entries = Object.entries(records || {}).map(([id, record]) => {
      const profile = toProfile(id, usersById[id]);
      const isWorker = profile.role === 'service-provider';
      const wantWorker = tab === 'workers';
      if (wantWorker !== isWorker) return null;

      const pendingDocs = (record?.stage3?.documents || [])
        .map((d, idx) => (isDocPending(d) ? { doc: d, docIndex: idx } : null))
        .filter(Boolean);

      const hasPendingIdentity = record?.stage2?.reviewStatus === 'pending';
      const hasPendingActivation =
        isWorker && record?.stage2?.reviewStatus === 'reviewed' && !record?.stage4?.activatedAt;

      if (!hasPendingIdentity && pendingDocs.length === 0 && !hasPendingActivation) return null;

      return {
        id,
        record,
        profile,
        pendingDocs,
        hasPendingIdentity,
        hasPendingActivation,
        latestAt: latestSubmissionAt(record),
      };
    });
    return entries.filter(Boolean);
  }, [records, usersById, tab]);

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
      if (sort.key === 'name') {
        return dir * String(a.profile?.name || '').localeCompare(String(b.profile?.name || ''), undefined, { sensitivity: 'base' });
      }
      return dir * ((a.latestAt || 0) - (b.latestAt || 0));
    });
  }, [items, sort.key, sort.dir]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages, setPage]);
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  if (!totalItems) {
    return (
      <EmptyState
        title={tab === 'workers' ? 'No worker submissions waiting' : 'No employer submissions waiting'}
        hint="When someone submits an identity and/or supporting document, they’ll show up here."
      />
    );
  }

  return (
    <>
      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPrev={() => setPage(Math.max(1, page - 1))}
        onNext={() => setPage(Math.min(totalPages, page + 1))}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {paged.map(({ id, record, profile, pendingDocs, hasPendingIdentity, hasPendingActivation }) => (
          <ReviewCard
            key={id}
            header={
              <header className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Submission pending
                  </p>
                  <h3 className="mt-0.5 text-base font-semibold text-gray-900">{profile.name}</h3>
                  <p className="text-xs text-gray-500">{profile.subtitle}</p>
                </div>
                <TrustBadge tier={getTrustTier(record, profile.role)} role={profile.role} size="sm" />
              </header>
            }
          >
            <dl className="mt-3 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <dt>Latest activity</dt>
                <dd className="font-medium text-gray-800">
                  {latestSubmissionAt(record)
                    ? formatDate(new Date(latestSubmissionAt(record)).toISOString())
                    : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Email verified</dt>
                <dd className="max-w-[55%] break-all font-medium text-gray-800">
                  {record.stage1?.email || record.stage1?.mobile || '—'}
                </dd>
              </div>
            </dl>

            {hasPendingIdentity ? (
              <section className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Identity review</p>
                <p className="mt-1 text-xs text-gray-600">
                  ID submitted {formatDate(record.stage2?.idSubmittedAt)}.
                </p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <PreviewImage
                    src={record.stage2?.idImage}
                    label="Government ID (Front)"
                    fallbackIcon={HiOutlineUserCircle}
                  />
                  <PreviewImage
                    src={record.stage2?.idBackImage}
                    label="Government ID (Back)"
                    fallbackIcon={HiOutlineUserCircle}
                  />
                  <PreviewImage
                    src={record.stage2?.selfieImage}
                    label="Selfie w/ ID"
                    fallbackIcon={HiOutlineUserCircle}
                  />
                </div>
              </section>
            ) : null}

            {pendingDocs.length ? (
              <section className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Supporting documents</p>
                <div className="mt-2 space-y-3">
                  {pendingDocs.map(({ doc, docIndex }) => (
                    <div key={`${id}-doc-${docIndex}`} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{doc?.label || 'Document'}</p>
                          <p className="mt-0.5 text-[11px] text-gray-500">
                            Submitted {formatDate(doc?.submittedAt)} · type {doc?.type || '—'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2">
                        <PreviewImage
                          src={doc?.fileData}
                          label={doc?.label || 'Document'}
                          fallbackIcon={HiOutlineDocumentText}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {hasPendingIdentity || pendingDocs.length > 0 || hasPendingActivation ? (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  disabled={!hasPendingIdentity && pendingDocs.length === 0}
                  title={
                    !hasPendingIdentity && pendingDocs.length === 0
                      ? 'Nothing to reject — identity is already decided and there are no pending documents.'
                      : undefined
                  }
                  onClick={() => {
                    setApproveTarget(null);
                    setRejectUserId(id);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 shadow-sm hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <HiOutlineXCircle className="h-4 w-4" aria-hidden="true" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectUserId(null);
                    setApproveTarget({
                      id,
                      hasPendingIdentity,
                      pendingDocs,
                      canActivateWorker:
                        profile.role === 'service-provider' && !record.stage4?.activatedAt,
                      isWorker: profile.role === 'service-provider',
                    });
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1F4E79] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
                >
                  <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
                  Approve
                </button>
              </div>
            ) : null}

            {hasPendingActivation && !hasPendingIdentity && pendingDocs.length === 0 ? (
              <p className="mt-2 text-xs text-gray-600">
                Identity approved {formatDate(record.stage2?.reviewedAt)} · ready for PESO activation (use Approve to
                confirm).
              </p>
            ) : null}
          </ReviewCard>
        ))}
      </div>

      <RejectVerificationModal
        isOpen={Boolean(rejectUserId)}
        userId={rejectUserId}
        onClose={() => setRejectUserId(null)}
        onRejectApplication={onRejectApplication}
      />

      <ApproveActivationModal
        isOpen={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        isWorker={approveTarget?.isWorker}
        hasPendingIdentity={approveTarget?.hasPendingIdentity}
        pendingDocs={approveTarget?.pendingDocs}
        canActivateWorker={approveTarget?.canActivateWorker}
        onApproveIdentity={(note) => {
          if (!approveTarget) return;
          return onApproveIdentity(approveTarget.id, note);
        }}
        onApproveDoc={(docIndex, note) => {
          if (!approveTarget) return;
          return onApproveDoc(approveTarget.id, docIndex, note);
        }}
        onActivate={() => {
          if (!approveTarget) return;
          return onActivate(approveTarget.id);
        }}
      />
    </>
  );
}

export default AdminVerificationPage;
