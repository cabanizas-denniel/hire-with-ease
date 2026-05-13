import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useVerification } from '../../context/VerificationContext.jsx';

function GateCard({ title, body, actionTo = '/applicant/profile', actionLabel = 'Open Verification Center' }) {
  return (
    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{body}</p>
      <div className="mt-3">
        <Link
          to={actionTo}
          className="inline-flex items-center justify-center rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

function computeWorkerGate(record) {
  const stage2Reviewed = record?.stage2?.reviewStatus === 'reviewed';
  const documentBacked = Boolean(record?.stage3?.documentBacked);
  const activated = Boolean(record?.stage4?.activatedAt);

  // Per your UI request: keep one PESO activation prompt (shown whenever access is locked).
  if (!activated) {
    const missing =
      !stage2Reviewed
          ? 'Submit your ID + selfie and wait for PESO review.'
          : !documentBacked
            ? 'Upload supporting documents (TESDA, Barangay clearance, etc.).'
            : 'Your file is complete — waiting for PESO to activate your account.';
    return {
      blocked: true,
      title: 'PESO activation required',
      body: `You can’t see matches or job records until your account is activated. ${missing}`,
    };
  }

  return { blocked: false };
}

export function useWorkerAccessGate() {
  const { user } = useAuth();
  const { records } = useVerification();
  const record = user?.uid ? records[user.uid] : null;

  return useMemo(() => computeWorkerGate(record), [record]);
}

export default function WorkerAccessGate() {
  const gate = useWorkerAccessGate();
  if (!gate.blocked) return null;
  return (
    <GateCard
      title={gate.title}
      body={gate.body}
      actionTo="/applicant/profile"
      actionLabel="Go to Profile Verification"
    />
  );
}

