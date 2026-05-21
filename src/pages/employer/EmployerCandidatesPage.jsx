import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineCheckBadge,
  HiOutlineXMark,
} from 'react-icons/hi2';
import FindingWorkersPanel from '../../components/employer/FindingWorkersPanel.jsx';
import AgreementCard from '../../components/matching/AgreementCard.jsx';
import ChatPanel from '../../components/matching/ChatPanel.jsx';
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
  const { data: applicants, loading: appsLoading } = useApplicationsForJob(jobId);
  const { data: workerProfiles, loading: profilesLoading } = useWorkerProfiles();
  const { data: matchDeclines } = useMatchDeclines(jobId);
  const [engineRunning, setEngineRunning] = useState(false);

  const declinedWorkerIds = useMemo(
    () => collectDeclinedWorkerIds(jobId, workerProfiles, matchDeclines || []),
    [jobId, workerProfiles, matchDeclines],
  );

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

  const matchedWorkers = useMemo(
    () =>
      job ? hydrateEngineMatches(job, workerProfiles, declinedWorkerIds) : [],
    [job, workerProfiles, declinedWorkerIds],
  );

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
    if (!job || !ownerUid || job.postedBy !== ownerUid) return;
    if (job.engineRanAt || profilesLoading) return;
    let cancelled = false;
    setEngineRunning(true);
    runJobMatching(job)
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setEngineRunning(false);
      });
    return () => {
      cancelled = true;
    };
  }, [job, ownerUid, profilesLoading]);

  const showFindingUi = findingWorkers || engineRunning;

  const activeApplicants = useMemo(
    () =>
      filterRealApplications(applicants).filter((a) =>
        ACTIVE_APPLICATION_STATUSES.has(a.status)
      ),
    [applicants]
  );

  const [chatWorkerId, setChatWorkerId] = useState(null);
  const [chatWorkerName, setChatWorkerName] = useState(null);
  const [pickedAppId, setPickedAppId] = useState(null);
  const fallbackAppId = activeApplicants[0]?.docId || activeApplicants[0]?.id || null;
  const selectedAppId =
    pickedAppId && activeApplicants.some((a) => (a.docId || a.id) === pickedAppId)
      ? pickedAppId
      : fallbackAppId;

  const selected = activeApplicants.find(
    (a) => (a.docId || a.id) === selectedAppId
  );

  const activeWorkerId = selected?.workerId || chatWorkerId;
  const activeWorkerName = selected?.workerName || chatWorkerName;

  const handleChatWithMatch = (entry) => {
    const id = entry.profile?.docId || entry.profile?.uid;
    if (!id) return;
    setChatWorkerId(id);
    setChatWorkerName(entry.profile?.name || 'Worker');
    setPickedAppId(null);
  };

  const handleSelectApplicant = async (app) => {
    const id = app.docId || app.id;
    setPickedAppId(id);
    setChatWorkerId(app.workerId);
    setChatWorkerName(app.workerName || 'Worker');
    if (app.status === APPLICATION_STATUS.PENDING) {
      try {
        await moveToNegotiating(id);
      } catch {
        /* worker may have already advanced */
      }
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

  const handleDecline = async (app) => {
    if (!window.confirm(`Decline ${app.workerName || 'this applicant'}?`)) return;
    try {
      await declineApplication(app.docId || app.id);
    } catch (err) {
      alert(err.message || 'Could not decline applicant.');
    }
  };

  const pageTitle = showFindingUi ? 'Finding workers' : 'Applicants';
  const pageSubtitle = showFindingUi
    ? job
      ? `Matching workers for "${job.title}"`
      : 'Loading your request…'
    : job
      ? `Workers who responded to "${job.title}"`
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
          onChatWithMatch={showFindingUi ? undefined : handleChatWithMatch}
          chatWorkerId={chatWorkerId}
        />
      ) : null}

      {job && activeWorkerId && !showFindingUi ? (
        <section className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
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
            compact
          />
          {selected ? (
            <AgreementCard
              application={selected}
              role="client"
              jobBudget={job.budget}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
              <p className="font-semibold text-[#1F4E79]">Agreement</p>
              <p className="mt-1">
                This worker has not applied yet. You can chat using suggested prompts above.
                Once they apply, you can propose and confirm a final agreement here.
              </p>
            </div>
          )}
        </section>
      ) : null}

      {!showFindingUi ? (
        <>
          <h3 className="mb-3 px-1 text-sm font-semibold text-[#1F4E79]">
            Applicants who applied
          </h3>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
            <aside className="space-y-2">
              <p className="px-1 text-xs text-gray-500">
                Applicants ({activeApplicants.length})
              </p>

              {appsLoading ? (
                <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm">
                  Loading…
                </p>
              ) : null}

              {!appsLoading && activeApplicants.length === 0 ? (
                <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm">
                  No one has applied yet. Matched workers above can see your request — they
                  will appear here once they apply.
                </p>
              ) : null}

              <ul className="space-y-2">
                {activeApplicants.map((app) => {
                  const id = app.docId || app.id;
                  const isSelected = id === selectedAppId;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => handleSelectApplicant(app)}
                        className={`w-full rounded-xl border bg-white p-3 text-left shadow-sm transition ${
                          isSelected
                            ? 'border-[#1F4E79] ring-2 ring-[#1F4E79]/30'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#1F4E79]">
                              {app.workerName || 'Worker'}
                            </p>
                            <p className="mt-0.5 text-[11px] text-gray-500">
                              Applied {formatDate(app.appliedAt)}
                            </p>
                          </div>
                          <ApplicationStatusPill status={app.status} />
                        </div>
                        {app.workerSkills?.length ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {app.workerSkills.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className="rounded-full bg-[#2E75B6]/10 px-2 py-0.5 text-[10px] font-medium text-[#1F4E79]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            {isSelected ? 'Open chat' : 'Chat'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecline(app);
                            }}
                            className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 hover:bg-red-100"
                          >
                            <HiOutlineXMark className="h-3 w-3" aria-hidden="true" />
                            Decline
                          </button>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <div className="space-y-3">
              {!activeWorkerId ? (
                <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
                  {activeApplicants.length === 0
                    ? 'Click Chat & negotiate on a matched worker above.'
                    : 'Select an applicant, or chat with a matched worker above.'}
                </div>
              ) : null}
              {job?.confirmedWorkerId ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                  <HiOutlineCheckBadge
                    className="mr-1 inline h-4 w-4 align-text-bottom"
                    aria-hidden="true"
                  />
                  This job is locked to {job.confirmedWorkerName || 'the chosen worker'}.
                </p>
              ) : null}
            </div>
          </div>
        </>
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

function ApplicationStatusPill({ status }) {
  const styles = {
    [APPLICATION_STATUS.PENDING]: 'bg-amber-100 text-amber-800',
    [APPLICATION_STATUS.NEGOTIATING]: 'bg-blue-100 text-blue-800',
    [APPLICATION_STATUS.PROPOSED]: 'bg-purple-100 text-purple-800',
    [APPLICATION_STATUS.CONFIRMED]: 'bg-emerald-100 text-emerald-800',
    [APPLICATION_STATUS.DECLINED]: 'bg-gray-100 text-gray-500',
    [APPLICATION_STATUS.COMPLETED]: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        styles[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(value) {
  if (!value) return '—';
  if (value?.toDate) return value.toDate().toLocaleDateString();
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return '—';
  }
}

export default EmployerCandidatesPage;
