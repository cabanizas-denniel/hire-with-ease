import { useMemo, useState } from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineEnvelope,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineIdentification,
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
  const { records, getProgress, getTier } = useVerification();
  const record = records[userId] || null;

  const [otpOpen, setOtpOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);

  const progress = useMemo(() => getProgress(userId), [getProgress, userId, records]); // eslint-disable-line react-hooks/exhaustive-deps
  const tier = useMemo(() => getTier(userId), [getTier, userId, records]); // eslint-disable-line react-hooks/exhaustive-deps

  const stage1Done = progress?.stages.stage1.state === 'complete';
  const stage2State = progress?.stages.stage2.state ?? 'not-started';
  const stage3State = progress?.stages.stage3.state ?? 'not-started';
  const stage4Done = progress?.stages.stage4.state === 'complete';

  const stages = [
    {
      key: 'stage1',
      icon: HiOutlineEnvelope,
      title: 'Email verification',
      body: stage1Done
        ? `Confirmed ${record?.stage1?.email || record?.stage1?.mobile || 'on file'} · ${formatDate(record?.stage1?.otpVerifiedAt)}`
        : 'Confirm your email address with a 6-digit code.',
      state: stage1Done ? 'complete' : 'pending',
      action: stage1Done
        ? { label: 'Update email', onClick: () => setOtpOpen(true), variant: 'secondary' }
        : { label: 'Verify email', onClick: () => setOtpOpen(true), variant: 'primary' },
    },
    {
      key: 'stage2',
      icon: HiOutlineIdentification,
      title: 'Identity Verification',
      body: identityBody(stage2State, record),
      state: identityUiState(stage2State),
      action: identityAction(stage2State, stage1Done, () => setIdentityOpen(true)),
    },
    {
      key: 'stage3',
      icon: HiOutlineDocumentText,
      title: 'Supporting Documents',
      body: documentsBody(record),
      state:
        stage3State === 'complete'
          ? 'complete'
          : stage3State === 'in-review'
            ? 'in-review'
            : 'pending',
      action: {
        label:
          (record?.stage3?.documents?.length || 0) > 0 ? 'Add another' : 'Upload document',
        onClick: () => setDocOpen(true),
        variant: 'secondary',
        disabled: !stage1Done,
      },
    },
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
            <TrustBadge tier={tier} size="md" />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {TIER_DESCRIPTIONS[tier] ||
              'Complete each stage to unlock more jobs and build trust.'}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p className="font-semibold text-[#1F4E79]">
            {completedStages} / 4 complete
          </p>
          <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-[#1F4E79] transition-all"
              style={{ width: `${(completedStages / 4) * 100}%` }}
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
        />
      ) : null}
      {docOpen ? (
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
          <p className="mt-0.5 text-xs text-gray-600">{body}</p>
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
    return `Rejected: ${record?.stage2?.reviewNote || 'Please resubmit with clearer images.'}`;
  }
  return 'Upload a government-issued ID and a selfie holding it.';
}

function identityAction(s, stage1Done, openFn) {
  if (s === 'pending') return null;
  return {
    label: s === 'rejected' ? 'Resubmit' : s === 'reviewed' ? 'Update' : 'Start verification',
    onClick: openFn,
    variant: s === 'reviewed' ? 'secondary' : 'primary',
    disabled: !stage1Done,
  };
}

function documentsBody(record) {
  const docs = record?.stage3?.documents || [];
  if (!docs.length) {
    return 'Optional but recommended — Barangay Clearance, TESDA certificate, Police clearance, etc.';
  }
  const reviewed = docs.filter((d) => d.reviewed).length;
  return `${docs.length} submitted · ${reviewed} reviewed by PESO.`;
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
