import { useMemo, useState } from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineEnvelope,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineIdentification,
  HiOutlineTrash,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext.jsx';
import { useVerification } from '../../context/VerificationContext.jsx';
import { TIER_DESCRIPTIONS } from '../../utils/trust.js';
import TrustBadge from '../TrustBadge.jsx';
import DocumentUploadModal from './DocumentUploadModal.jsx';
import IdentitySubmissionModal from './IdentitySubmissionModal.jsx';
import OtpVerifyModal from './OtpVerifyModal.jsx';

/**
 * One-stop verification panel for a given user id. Shows the 4 stages
 * as a stepper and opens the relevant modal when the user clicks the
 * per-stage action button. Stage 4 (activation) is driven by the admin;
 * this component simply surfaces its status.
 */
function VerificationCenter({ userId, role = 'service-provider', className = '' }) {
  const { user } = useAuth();
  const { records, getProgress, getTier, removeDocument } = useVerification();
  const record = records[userId] || null;
  /** Must match trust.js role (client = homeowner / employer UI). */
  const trustRole = role === 'client' ? 'client' : 'service-provider';

  const [otpOpen, setOtpOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);

  const progress = useMemo(
    () => getProgress(userId, trustRole),
    [getProgress, userId, trustRole, records] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const tier = useMemo(
    () => getTier(userId, trustRole),
    [getTier, userId, trustRole, records] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const stage1Done = progress?.stages.stage1.state === 'complete';
  const stage2State = progress?.stages.stage2.state ?? 'not-started';
  const stage3State = progress?.stages.stage3.state ?? 'not-started';
  const stage4Done = progress?.stages.stage4.state === 'complete';
  const showSupportingDocs = role === 'service-provider';
  const docs = record?.stage3?.documents || [];

  const stages = [
    {
      key: 'stage1',
      icon: HiOutlineEnvelope,
      title: 'Email verification',
      body: 'Email is verified through your login email. Email changes are disabled.',
      state: 'complete',
      action: null,
    },
    {
      key: 'stage2',
      icon: HiOutlineIdentification,
      title: 'Identity Verification',
      body: identityBody(stage2State, record),
      state: identityUiState(stage2State),
      action: identityAction(stage2State, stage1Done, () => setIdentityOpen(true)),
    },
    ...(showSupportingDocs
      ? [
          {
            key: 'stage3',
            icon: HiOutlineDocumentText,
            title: 'Supporting Documents',
            body: (
              <div className="space-y-2">
                <p className="text-xs text-gray-600">{documentsBody(record)}</p>
                {docs.length ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {docs.map((d, idx) => {
                      const status =
                        d?.reviewStatus ||
                        (d?.reviewed === true ? 'reviewed' : d?.reviewed === false ? 'pending' : 'pending');
                      const pill =
                        status === 'reviewed'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : status === 'rejected'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-amber-200 bg-amber-50 text-amber-800';
                      const label =
                        status === 'reviewed' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'In review';
                      const canRemove = status === 'pending' || status === 'rejected';
                      return (
                        <div key={`doc-${idx}`} className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-gray-800">
                                {d?.label || 'Document'}
                              </p>
                              <p className="mt-0.5 text-[11px] text-gray-500">
                                {d?.submittedAt ? `Submitted ${formatDate(d.submittedAt)}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pill}`}>
                                {label}
                              </span>
                              {canRemove ? (
                                <button
                                  type="button"
                                  onClick={() => removeDocument(userId, { docIndex: idx })}
                                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                  <HiOutlineTrash className="h-3.5 w-3.5" aria-hidden="true" />
                                  Remove
                                </button>
                              ) : null}
                            </div>
                          </div>
                          {d?.fileData ? (
                            <div className="mt-2 overflow-hidden rounded-md border border-gray-200 bg-white">
                              <img
                                src={d.fileData}
                                alt={d?.label || 'Document'}
                                className="max-h-40 w-full object-contain"
                              />
                            </div>
                          ) : null}
                          {status === 'rejected' && d?.reviewNote ? (
                            <p className="mt-2 rounded-md bg-red-50 px-2 py-1 text-[11px] text-red-700">
                              Rejected: {d.reviewNote}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ),
            state:
              stage3State === 'complete'
                ? 'complete'
                : stage3State === 'in-review'
                  ? 'in-review'
                  : 'pending',
            action: {
              label:
                (record?.stage3?.documents?.length || 0) > 0
                  ? 'Add another'
                  : 'Upload document',
              onClick: () => setDocOpen(true),
              variant: 'secondary',
              disabled: !stage1Done,
            },
          },
        ]
      : []),
    {
      key: 'stage4',
      icon: HiOutlineShieldCheck,
      title:
        role === 'service-provider' ? 'PESO Activation' : 'Trust Upgrade',
      body:
        stage4Done
          ? `Activated ${formatDate(record?.stage4?.activatedAt)} by ${record?.stage4?.activatedBy || 'PESO'}.`
          : role === 'service-provider'
            ? 'A PESO officer activates your account once your identity is approved.'
            : 'Trust bump applied automatically after identity is reviewed.',
      state: stage4Done ? 'complete' : 'waiting',
      action: null,
    },
  ];

  const completedStages = stages.filter((s) => s.state === 'complete').length;
  const totalStages = stages.length;

  return (
    <section
      className={`rounded-xl border border-blue-100 bg-white shadow-sm ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-[#1F4E79]">
              Verification Center
            </h2>
            <TrustBadge tier={tier} role={role === 'service-provider' ? 'service-provider' : 'client'} size="md" />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {TIER_DESCRIPTIONS[tier] ||
              'Complete each stage to unlock more jobs and build trust.'}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p className="font-semibold text-[#1F4E79]">
            {completedStages} / {totalStages} complete
          </p>
          <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-[#1F4E79] transition-all"
              style={{ width: `${(completedStages / totalStages) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <ol className="divide-y divide-gray-100">
        {stages.map((stage, idx) => (
          <StageRow key={stage.key} index={idx + 1} {...stage} />
        ))}
      </ol>

      {otpOpen ? (
        <OtpVerifyModal
          isOpen
          userId={userId}
          accountEmail={user?.email || ''}
          existingEmail={record?.stage1?.email}
          onClose={() => setOtpOpen(false)}
        />
      ) : null}
      {identityOpen ? (
        <IdentitySubmissionModal
          isOpen
          userId={userId}
          onClose={() => setIdentityOpen(false)}
          previousSubmissionRejected={stage2State === 'rejected'}
          rejectionNote={record?.stage2?.reviewNote || ''}
        />
      ) : null}
      {showSupportingDocs && docOpen ? (
        <DocumentUploadModal
          isOpen
          userId={userId}
          onClose={() => setDocOpen(false)}
        />
      ) : null}
    </section>
  );
}

function StageRow({ index, icon, title, body, state, action }) {
  const Icon = icon;
  const { pillClass, PillIcon, pillLabel } = stateBadge(state);
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F4E79]/10 text-[#1F4E79]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Stage {index}
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pillClass}`}
            >
              <PillIcon className="h-3 w-3" aria-hidden="true" />
              {pillLabel}
            </span>
          </div>
          <h3 className="mt-0.5 text-sm font-semibold text-gray-900">{title}</h3>
          <div className="mt-0.5 text-xs text-gray-600">{body}</div>
        </div>
      </div>

      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className={`self-start whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
            action.variant === 'primary'
              ? 'bg-[#1F4E79] text-white hover:brightness-110'
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {action.label}
        </button>
      ) : null}
    </li>
  );
}

function stateBadge(state) {
  switch (state) {
    case 'complete':
      return {
        pillClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        PillIcon: HiOutlineCheckCircle,
        pillLabel: 'Done',
      };
    case 'in-review':
    case 'pending-review':
      return {
        pillClass: 'border-amber-200 bg-amber-50 text-amber-800',
        PillIcon: HiOutlineClock,
        pillLabel: 'In review',
      };
    case 'rejected':
      return {
        pillClass: 'border-red-200 bg-red-50 text-red-700',
        PillIcon: HiOutlineExclamationTriangle,
        pillLabel: 'Needs changes',
      };
    case 'waiting':
      return {
        pillClass: 'border-gray-200 bg-gray-50 text-gray-600',
        PillIcon: HiOutlineSparkles,
        pillLabel: 'Waiting',
      };
    case 'pending':
    default:
      return {
        pillClass: 'border-sky-200 bg-sky-50 text-sky-800',
        PillIcon: HiOutlineClock,
        pillLabel: 'To do',
      };
  }
}

function identityUiState(s) {
  if (s === 'reviewed') return 'complete';
  if (s === 'pending') return 'pending-review';
  if (s === 'rejected') return 'rejected';
  return 'pending';
}

function identityBody(s, record) {
  if (s === 'reviewed') {
    return `Approved ${formatDate(record?.stage2?.reviewedAt)} by ${record?.stage2?.reviewedBy || 'PESO'}.`;
  }
  if (s === 'pending') {
    return `Submitted ${formatDate(record?.stage2?.idSubmittedAt)} · waiting for PESO review.`;
  }
  if (s === 'rejected') {
    const when = formatDate(record?.stage2?.idSubmittedAt);
    const note =
      record?.stage2?.reviewNote?.trim() || 'Please upload clearer photos of your ID (front and back) and selfie holding it.';
    return `Your submitted ID and selfie photos were rejected${when !== '—' ? ` (sent ${when})` : ''}. PESO note: ${note}`;
  }
  return 'Upload a government-issued ID and a selfie holding it.';
}

function identityAction(s, stage1Done, openFn) {
  if (s === 'pending') return null;
  return {
    label: s === 'rejected' ? 'Resubmit photos' : s === 'reviewed' ? 'Update' : 'Start verification',
    onClick: openFn,
    variant: s === 'reviewed' ? 'secondary' : 'primary',
    // After a rejection, always allow opening the modal (photos must be replaced).
    disabled: s === 'rejected' ? false : !stage1Done,
  };
}

function documentsBody(record) {
  const docs = record?.stage3?.documents || [];
  if (!docs.length) {
    return 'Optional but recommended — Barangay Clearance, TESDA certificate, Police clearance, etc.';
  }
  const reviewed = docs.filter((d) => d.reviewStatus === 'reviewed' || d.reviewed).length;
  const rejected = docs.filter((d) => d.reviewStatus === 'rejected').length;
  if (rejected) {
    return `${docs.length} submitted · ${reviewed} approved · ${rejected} needs changes.`;
  }
  return `${docs.length} submitted · ${reviewed} approved by PESO.`;
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default VerificationCenter;
