import { useMemo } from 'react';
import { HiOutlineClipboardDocumentList, HiOutlinePlusCircle } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import ActiveJobCard from '../../components/employer/ActiveJobCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getActiveJob, getCompletedJobs } from '../../utils/clientJobs.js';
import { getCurrentUserId } from '../../utils/currentUser.js';

function EmployerDashboardPage() {
  const auth = useAuth();
  const clientId = getCurrentUserId(auth);

  const activeJob = useMemo(() => getActiveJob(clientId), [clientId]);
  const completed = useMemo(() => getCompletedJobs(clientId), [clientId]);

  const lastCompleted = completed[0];

  return (
    <div>
      <PageHeader
        title="Client Dashboard"
        subtitle={
          activeJob
            ? 'Stay focused on your current job until it\'s done. You\'ll be able to request another service after.'
            : 'You don\'t have any ongoing requests. Post a job and the system will find the right worker for you.'
        }
      />

      {activeJob ? (
        <ActiveJobCard job={activeJob} />
      ) : (
        <NoActiveJobCard />
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          label="Jobs completed"
          value={completed.length}
          helperText="Lifetime"
        />
        <StatCard
          label="Last completed"
          value={lastCompleted?.postedAt || '—'}
          helperText={lastCompleted ? lastCompleted.title : 'No past jobs yet'}
        />
      </div>

      {!activeJob ? (
        <section className="mt-5 rounded-xl bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold text-[#1F4E79]">Quick Actions</h2>
          <p className="mt-1 text-sm text-gray-600">
            Describe what you need — the system handles finding available,
            qualified workers.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/employer/post-job"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1F4E79] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110"
            >
              <HiOutlinePlusCircle className="h-4 w-4" aria-hidden="true" />
              Request a Service
            </Link>
            <Link
              to="/employer/hired"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#1F4E79] px-4 py-2.5 text-sm font-semibold text-[#1F4E79] hover:bg-blue-50"
            >
              <HiOutlineClipboardDocumentList className="h-4 w-4" aria-hidden="true" />
              View Job History
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function NoActiveJobCard() {
  return (
    <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1F4E79]/10 text-[#1F4E79]">
        <HiOutlinePlusCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-3 text-lg font-semibold text-[#1F4E79]">
        No ongoing request
      </h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">
        You can only have one active request at a time. When you're ready to
        book a new service, submit a request and the system will find the best
        worker for you.
      </p>
      <Link
        to="/employer/post-job"
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1F4E79] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110"
      >
        <HiOutlinePlusCircle className="h-4 w-4" aria-hidden="true" />
        Request a Service
      </Link>
    </section>
  );
}

export default EmployerDashboardPage;
