import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import FindingWorkersPanel from '../../components/employer/FindingWorkersPanel.jsx';
import ChatPanel from '../../components/matching/ChatPanel.jsx';
import PaymentFulfillmentCard from '../../components/matching/PaymentFulfillmentCard.jsx';
import JobIssueMedia from '../../components/JobIssueMedia.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import SkillBadge from '../../components/SkillBadge.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { filterRealApplications, hydrateEngineMatches } from '../../lib/matching/index.js';
import { collectDeclinedWorkerIds } from '../../lib/matching/matchDeclines.js';
import { pruneDeclinedEngineMatches } from '../../lib/matching/jobs.js';
import { runJobMatching } from '../../lib/matching/runJobMatching.js';
import {
  useApplicationsForJob,
  useJob,
  useMatchDeclines,
  useWorkerProfiles,
} from '../../lib/matching/hooks.js';
import { setJobStatus, setMatchedWorkers } from '../../lib/matching/jobs.js';
import {
  declineApplication,
  moveToNegotiating,
} from '../../lib/matching/applications.js';
import {
  ACTIVE_APPLICATION_STATUSES,
  APPLICATION_STATUS,
  JOB_STATUS,
} from '../../lib/matching/statuses.js';
import { locationLabel } from '../../utils/clientJobs.js';

const FINDING_MIN_MS = 3200;

function EmployerCandidatesPage() {
  const { jobId } = useParams();
  const auth = useAuth();
  const ownerUid = auth?.user?.uid || null;

  const { data: job, loading: jobLoading } = useJob(jobId);
  const { data: applicants } = useApplicationsForJob(jobId);
  const { data: workerProfiles, loading: profilesLoading } = useWorkerProfiles();
  const { data: matchDeclines } = useMatchDeclines(jobId);
  const [engineRunning, setEngineRunning] = useState(false);
  const lastMatchPassRef = useRef('');

  const declinedWorkerIds = useMemo(
    () => collectDeclinedWorkerIds(jobId, workerProfiles, matchDeclines || []),
    [jobId, workerProfiles, matchDeclines],
  );

  const declinedFromApplications = useMemo(
    () =>
      new Set(
        (applicants || [])
          .filter((a) => a.status === APPLICATION_STATUS.DECLINED && a.workerId)
          .map((a) => a.workerId),
      ),
    [applicants],
  );

  const excludedWorkerIds = useMemo(() => {
    const ids = new Set(declinedWorkerIds);
    declinedFromApplications.forEach((id) => ids.add(id));
    return ids;
  }, [declinedWorkerIds, declinedFromApplications]);

  const [findingWorkers, setFindingWorkers] = useState(() =>
    Boolean(jobId && sessionStorage.getItem(`hwe-finding-workers-${jobId}`))
  );

  useEffect(() => {
    if (!jobId || !findingWorkers) return;
    const key = `hwe-finding-workers-${jobId}`;
    const timer = window.setTimeout(() => {
      sessionStorage.removeItem(key);
      setFindingWorkers(false);
    }, FINDING_MIN_MS);
    return () => window.clearTimeout(timer);
  }, [jobId, findingWorkers]);

  const engineMatches = useMemo(
    () =>
      job ? hydrateEngineMatches(job, workerProfiles, excludedWorkerIds) : [],
    [job, workerProfiles, excludedWorkerIds],
  );

  const activeApplicants = useMemo(
    () =>
      filterRealApplications(applicants).filter((a) =>
        ACTIVE_APPLICATION_STATUSES.has(a.status)
      ),
    [applicants]
  );

  const applicantsByWorkerId = useMemo(() => {
    const map = new Map();
    activeApplicants.forEach((app) => {
      if (app.workerId) map.set(app.workerId, app);
    });
    return map;
  }, [activeApplicants]);

  /** Shortlist cards + any accepted worker missing from engine output. */
  const matchedWorkers = useMemo(() => {
    const byId = new Map();
    engineMatches.forEach((entry) => {
      const id = entry.profile?.docId || entry.profile?.uid;
      if (!id || excludedWorkerIds.has(id)) return;
      byId.set(id, entry);
    });

    activeApplicants.forEach((app) => {
      const id = app.workerId;
      if (!id || byId.has(id) || excludedWorkerIds.has(id)) return;
      const profile =
        workerProfiles.find((p) => (p.docId || p.uid) === id) || {
          docId: id,
          uid: id,
          name: app.workerName || 'Worker',
          skills: app.workerSkills || [],
        };
      byId.set(id, {
        profile,
        score: 70,
        reasons: ['Accepted your request'],
        matchedSkills: app.workerSkills || [],
      });
    });

    const list = Array.from(byId.values()).filter((entry) => {
      const id = entry.profile?.docId || entry.profile?.uid;
      if (!id || excludedWorkerIds.has(id)) return false;
      // Once a hire is confirmed, only that worker remains visible.
      if (job?.confirmedWorkerId) return id === job.confirmedWorkerId;
      return true;
    });
    list.sort((a, b) => {
      const aId = a.profile?.docId || a.profile?.uid;
      const bId = b.profile?.docId || b.profile?.uid;
      const aAcc = applicantsByWorkerId.has(aId) ? 1 : 0;
      const bAcc = applicantsByWorkerId.has(bId) ? 1 : 0;
      if (aAcc !== bAcc) return bAcc - aAcc;
      return (b.score || 0) - (a.score || 0);
    });
    return list;
  }, [
    engineMatches,
    activeApplicants,
    workerProfiles,
    applicantsByWorkerId,
    excludedWorkerIds,
    job?.confirmedWorkerId,
  ]);

  useEffect(() => {
    if (!job || !ownerUid || job.postedBy !== ownerUid) return;
    if (!job.confirmedWorkerId || !jobId) return;
    const lockedApp = (applicants || []).find(
      (a) => a.workerId === job.confirmedWorkerId,
    );
    if (!lockedApp || lockedApp.status !== APPLICATION_STATUS.DECLINED) return;
    import('../../lib/matching/applications.js')
      .then(({ unlockConfirmedHire }) => unlockConfirmedHire(jobId))
      .catch(() => {});
  }, [job, ownerUid, jobId, applicants]);

  useEffect(() => {
    if (!job || !ownerUid || job.postedBy !== ownerUid || profilesLoading) return;
    void pruneDeclinedEngineMatches(
      job.docId || job.id,
      job,
      workerProfiles,
      matchDeclines || [],
    );
  }, [job, ownerUid, profilesLoading, workerProfiles, matchDeclines]);

  useEffect(() => {
    if (!job || !ownerUid || job.postedBy !== ownerUid || profilesLoading) return;
    const id = job.docId || job.id;
    if (!id) return;

    const passKey = `${id}|${workerProfiles.length}|${job.scheduledStartAt || ''}|${(job.requiredSkills || []).join(',')}`;
    if (lastMatchPassRef.current === passKey) return;
    lastMatchPassRef.current = passKey;

    let cancelled = false;
    const firstRun = !job.engineRanAt;
    if (firstRun) setEngineRunning(true);

    runJobMatching(job, { notify: firstRun })
      .catch(() => {
        lastMatchPassRef.current = '';
      })
      .finally(() => {
        if (!cancelled && firstRun) setEngineRunning(false);
      });

    return () => {
      cancelled = true;
    };
  }, [job, ownerUid, profilesLoading, workerProfiles.length]);

  const showFindingUi = findingWorkers || engineRunning;

  const [pickedWorkerId, setPickedWorkerId] = useState(null);
  const selected =
    (pickedWorkerId && applicantsByWorkerId.get(pickedWorkerId)) ||
    activeApplicants[0] ||
    null;

  const activeWorkerId = selected?.workerId || null;
  const activeWorkerName = selected?.workerName || null;

  const appliedWorkerIds = useMemo(
    () => new Set(activeApplicants.map((a) => a.workerId).filter(Boolean)),
    [activeApplicants],
  );

  const handleChatWithCard = async (entry) => {
    const id = entry.profile?.docId || entry.profile?.uid;
    if (!id) return;
    const app = applicantsByWorkerId.get(id);
    if (!app) return;
    setPickedWorkerId(id);
    if (app.status === APPLICATION_STATUS.PENDING) {
      try {
        await moveToNegotiating(app.docId || app.id);
      } catch {
        /* already advanced */
      }
    }
  };

  const handleDeclineCard = async (entry) => {
    const id = entry.profile?.docId || entry.profile?.uid;
    if (!id || !jobId) return;
    const app = applicantsByWorkerId.get(id);
    const name = entry.profile?.name || app?.workerName || 'this worker';
    if (
      !window.confirm(
        `Decline ${name}? They will be removed from this request and won’t be rematched.`,
      )
    ) {
      return;
    }
    try {
      if (app) {
        await declineApplication(app.docId || app.id, { byRole: 'client' });
      } else {
        const { recordMatchDecline } = await import('../../lib/matching/matchDeclines.js');
        const { removeWorkerFromJobShortlist } = await import('../../lib/matching/jobs.js');
        await recordMatchDecline({ jobId, workerId: id });
        await removeWorkerFromJobShortlist(jobId, id);
      }
      if (pickedWorkerId === id) setPickedWorkerId(null);
    } catch (err) {
      alert(err.message || 'Could not decline worker.');
    }
  };

  useEffect(() => {
    if (!job) return;
    if (!ownerUid || job.postedBy !== ownerUid) return;
    if (job.status === JOB_STATUS.COMPLETED) return;
    const desired = matchedWorkers.length;
    if ((job.matchedWorkers ?? 0) !== desired) {
      setMatchedWorkers(job.docId || job.id, desired).catch(() => {});
    }
  }, [
    activeApplicants.length,
    job,
    ownerUid,
    matchedWorkers.length,
    showFindingUi,
  ]);

  useEffect(() => {
    if (!job) return;
    if (!ownerUid || job.postedBy !== ownerUid) return;
    if (job.status !== JOB_STATUS.MATCHING) return;
    if (activeApplicants.length === 0) return;
    setJobStatus(job.docId || job.id, JOB_STATUS.MATCHED).catch(() => {});
  }, [activeApplicants.length, job, ownerUid]);

  const pageTitle = showFindingUi ? 'Finding workers' : 'Matched workers';
  const pageSubtitle = showFindingUi
    ? job
      ? `Matching workers for "${job.title}"`
      : 'Loading your request…'
    : job
      ? `Shortlist for "${job.title}"`
      : jobLoading
        ? 'Loading job…'
        : 'Job not found.';

  return (
    <div>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      <div className="mb-3">
        <Link
          to="/employer/jobs"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
        >
          <HiOutlineArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to My Requests
        </Link>
      </div>

      {job ? <JobSummaryCard job={job} /> : null}

      {job ? (
        <FindingWorkersPanel
          searching={showFindingUi}
          matches={matchedWorkers}
          jobTitle={job.title}
          appliedWorkerIds={appliedWorkerIds}
          acceptedCount={activeApplicants.length}
          chatWorkerId={activeWorkerId}
          onChat={handleChatWithCard}
          onDecline={job.confirmedWorkerId ? undefined : handleDeclineCard}
          hireLocked={Boolean(job.confirmedWorkerId)}
        />
      ) : null}

      {job && selected && activeWorkerId && !showFindingUi ? (
        <section className="mb-5 space-y-4">
          <ChatPanel
            jobId={job.docId || job.id}
            jobTitle={job.title}
            clientId={job.postedBy}
            clientName={job.postedByName || job.clientName}
            clientEmail={auth.user?.email || job.postedByEmail}
            clientMobile={auth.profile?.mobile || job.postedByMobile}
            workerId={activeWorkerId}
            workerName={activeWorkerName}
            role="client"
            jobBudget={job.budget}
            jobStatus={job.status}
            applicationStatus={selected?.status}
            application={selected}
            compact
          />
          {(job.status === JOB_STATUS.CONFIRMED ||
            job.status === JOB_STATUS.IN_PROGRESS ||
            selected?.status === APPLICATION_STATUS.CONFIRMED) &&
          job.confirmedWorkerId === activeWorkerId ? (
            <PaymentFulfillmentCard application={selected} role="client" />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function JobSummaryCard({ job }) {
  return (
    <section className="mb-5 overflow-hidden rounded-xl border border-blue-100 bg-blue-50/60">
      <JobIssueMedia job={job} variant="gallery" titleAlt={`Issue media for "${job.title}"`} />
      <div className="p-4 text-sm text-[#1F4E79]">
        <p className="font-semibold">
          {job.title} <StatusBadge status={job.status} />
        </p>
        <div className="mt-2 grid gap-1 text-xs text-gray-700 sm:grid-cols-2">
          <p className="sm:col-span-2">
            <span className="font-semibold text-[#1F4E79]">Home address:</span>{' '}
            {locationLabel(job) || '—'}
          </p>
          <p>
            <span className="font-semibold text-[#1F4E79]">Budget:</span>{' '}
            {job.budget || '—'}
          </p>
          <p>
            <span className="font-semibold text-[#1F4E79]">Schedule:</span>{' '}
            {job.schedule || '—'}
          </p>
        </div>
        {job.requiredSkills?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {job.requiredSkills.map((s) => (
              <SkillBadge key={s} skill={s} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default EmployerCandidatesPage;
