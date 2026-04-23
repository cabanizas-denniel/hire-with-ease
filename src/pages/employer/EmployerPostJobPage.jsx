import { useMemo, useState } from 'react';
import { HiOutlineExclamationTriangle, HiOutlineMapPin } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import ActiveJobCard from '../../components/employer/ActiveJobCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import skills from '../../data/skills.js';
import { JOB_CATEGORIES } from '../../data/jobs.js';
import { getActiveJob } from '../../utils/clientJobs.js';
import { getCurrentUserId } from '../../utils/currentUser.js';

function EmployerPostJobPage() {
  const auth = useAuth();
  const clientId = getCurrentUserId(auth);
  const activeJob = useMemo(() => getActiveJob(clientId), [clientId]);

  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    requiredSkills: [],
    budget: '',
    location: '',
    type: 'Scheduled',
    schedule: '',
    proof: '',
  });

  const toggleSkill = (skill) => {
    const selected = new Set(form.requiredSkills);
    if (selected.has(skill)) {
      selected.delete(skill);
    } else {
      selected.add(skill);
    }
    setForm((prev) => ({ ...prev, requiredSkills: Array.from(selected) }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('Service request submitted. The system will start matching workers and notify you when matches are found.');
  };

  if (activeJob) {
    return <BlockedByActiveJob activeJob={activeJob} />;
  }

  return (
    <div>
      <PageHeader
        title="Request a Service"
        subtitle="Describe what you need. The system will find and notify qualified, available workers automatically."
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
        <p className="font-medium">You don't need to search for workers</p>
        <p className="mt-1 text-gray-600">
          Fill in the details below. The matching engine evaluates worker skills, availability, location, and
          reliability — then pushes your request to the best-fit workers. You'll see ranked matches once workers respond.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Job Type</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Category</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                required
              >
                <option value="">Select a category</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Urgency</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    type: e.target.value,
                    schedule:
                      e.target.value === 'Rush' ? 'ASAP · Dispatch now' : '',
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
              >
                <option value="Scheduled">Scheduled (plan ahead)</option>
                <option value="Rush">Rush (dispatch now)</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-gray-600">Short title for this job</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
              placeholder="e.g. Kitchen faucet replacement"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
              rows={3}
              placeholder="Describe the issue, location details, what you need done..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Required Skills</h2>
          <p className="mb-3 text-xs text-gray-500">Select all that apply. This powers the matching engine.</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {skills.map((skill) => {
              const selected = form.requiredSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition ${
                    selected ? 'bg-[#1F4E79] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Schedule &amp; Budget</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Budget range</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                value={form.budget}
                onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
                required
              >
                <option value="">Select budget range</option>
                <option>PHP 500 - 1,000</option>
                <option>PHP 1,000 - 2,000</option>
                <option>PHP 2,000 - 3,000</option>
                <option>PHP 3,000 - 5,000</option>
                <option>PHP 5,000+</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {form.type === 'Rush'
                  ? 'Dispatch window'
                  : 'Scheduled start date & time'}
              </label>
              {form.type === 'Rush' ? (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <span className="mt-0.5 inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-amber-900">
                      Dispatch now — taxi-style
                    </p>
                    <p className="mt-0.5 text-xs text-amber-800/90">
                      The system will push this to the nearest available,
                      qualified workers immediately. Please be on-site and
                      ready to receive the worker within the hour.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                    value={form.schedule}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, schedule: e.target.value }))
                    }
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Workers see this exact start time. Please be present at the
                    location when they arrive.
                  </p>
                </>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Job location / address</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                placeholder="e.g. 123 Main St, Quezon City"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Photo of Issue (optional)</h2>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
            onChange={(e) => setForm((prev) => ({ ...prev, proof: e.target.files?.[0]?.name || '' }))}
          />
        </section>

        <button type="submit" className="rounded-lg bg-[#1F4E79] px-5 py-2.5 text-sm font-semibold text-white">
          Submit Request
        </button>
      </form>
    </div>
  );
}

function BlockedByActiveJob({ activeJob }) {
  return (
    <div>
      <PageHeader
        title="One Job at a Time"
        subtitle="You already have an ongoing request. Finish it before posting a new one."
      />

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <HiOutlineExclamationTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-amber-900 sm:text-base">
              Why can't I post another request right now?
            </h3>
            <p className="mt-1 text-sm text-amber-900/90">
              Workers are dispatched to <strong>your</strong> location and expect
              you to be there when they arrive.
            </p>
            <ul className="mt-2 space-y-1 text-sm text-amber-900/90">
              <li className="flex items-start gap-2">
                <HiOutlineMapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                  aria-hidden="true"
                />
                <span>
                  You can't be in two places at once — stay focused on{' '}
                  <strong>{activeJob.location}</strong> until this job is done.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <HiOutlineExclamationTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                  aria-hidden="true"
                />
                <span>
                  A second active request would mean a worker arriving at an
                  empty address — bad for you, worse for them.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <ActiveJobCard job={activeJob} />
      </div>

      <div className="mt-5 rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600 shadow-sm sm:p-5">
        <p>
          Once this job is marked <span className="font-semibold">Completed</span>
          , the <strong>Request a Service</strong> form will open back up
          automatically.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/employer/jobs"
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#1F4E79] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 sm:w-auto"
          >
            Go to My Requests
          </Link>
          <Link
            to="/employer/dashboard"
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EmployerPostJobPage;
