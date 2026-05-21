import { useEffect, useMemo, useRef, useState } from 'react';
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineExclamationTriangle,
  HiOutlinePhoto,
  HiOutlineTrash,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { Link, useNavigate } from 'react-router-dom';
import ActiveJobCard from '../../components/employer/ActiveJobCard.jsx';
import FormStepper from '../../components/FormStepper.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import SavedHomeAddressCard from '../../components/profile/SavedHomeAddressCard.jsx';
import { CATEGORY_REQUIRED_SKILLS, JOB_CATEGORIES } from '../../data/jobs.js';
import { getHomeownerLocationFromProfile, formatProfileHomeAddress } from '../../lib/homeLocation.js';
import { storage } from '../../lib/firebase.js';
import {
  assertIssueMediaFile,
  MAX_ISSUE_MEDIA_BYTES,
  uploadJobIssueFiles,
} from '../../lib/jobIssueMediaUpload.js';
import { createJob, findActiveJob, newJobId } from '../../lib/matching/jobs.js';
import { useJobsByOwner } from '../../lib/matching/hooks.js';
import { formatHomeAddress } from '../../utils/clientJobs.js';
import { isVideoMediaEntry } from '../../utils/jobMedia.js';

const WIZARD_STEPS = ['Identify the issue', 'Budget & schedule', 'Review & submit'];

function EmployerPostJobPage() {
  const auth = useAuth();
  const ownerUid = auth?.user?.uid || null;
  const ownerName = auth?.user?.fullName || null;

  const { data: myJobs, loading } = useJobsByOwner(ownerUid);
  const activeJob = useMemo(() => findActiveJob(myJobs), [myJobs]);

  const { refreshProfile } = auth;
  useEffect(() => {
    if (ownerUid) void refreshProfile?.();
  }, [ownerUid, refreshProfile]);

  const mediaInputRef = useRef(null);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    budget: '',
    type: 'Scheduled',
    schedule: '',
  });

  const [mediaDrafts, setMediaDrafts] = useState([]);

  const handleAddMedia = (event) => {
    const list = Array.from(event.target.files || []);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
    if (!list.length) return;
    setError(null);
    try {
      list.forEach((file) => assertIssueMediaFile(file));
    } catch (err) {
      setError(err.message || 'Could not add that file.');
      return;
    }
    setMediaDrafts((prev) => {
      const added = list.map((file) => ({
        key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...added];
    });
  };

  const handleRemoveDraft = (key) => {
    setMediaDrafts((prev) => {
      const found = prev.find((d) => d.key === key);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((d) => d.key !== key);
    });
  };

  const handleClearAllMedia = () => {
    mediaDrafts.forEach((d) => {
      if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
    });
    setMediaDrafts([]);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const validateStep = (stepIndex) => {
    if (stepIndex === 0) {
      if (!form.category) return 'Select a category.';
      if (!form.title.trim()) return 'Add a short title for this job.';
      if (!form.description.trim()) return 'Describe the issue.';
      if (!getHomeownerLocationFromProfile(auth.profile)) {
        return 'Set your home address on your Profile (map pin) before posting a request.';
      }
      if (mediaDrafts.length === 0) {
        return 'Add at least one photo or video of the issue.';
      }
    }
    if (stepIndex === 1) {
      if (!form.budget) return 'Select a budget range.';
      if (form.type !== 'Rush' && !form.schedule) {
        return 'Pick a scheduled date and time.';
      }
    }
    return null;
  };

  const goNext = () => {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const msg = validateStep(0) || validateStep(1);
    if (msg) {
      setError(msg);
      return;
    }
    if (!ownerUid) {
      setError('You need to be signed in to post a job.');
      return;
    }
    const requiredSkills = CATEGORY_REQUIRED_SKILLS[form.category];
    if (!requiredSkills?.length) {
      setError('Pick a category so we can match the right workers.');
      return;
    }

    const jobLocation = getHomeownerLocationFromProfile(auth.profile);
    if (!jobLocation) {
      setError('Set your home address on your Profile before posting.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const jobId = newJobId();
    const files = mediaDrafts.map((d) => d.file);
    try {
      const media = await uploadJobIssueFiles(storage, jobId, files);
      await createJob({
        id: jobId,
        title: form.title,
        category: form.category,
        description: form.description,
        requiredSkills,
        budget: form.budget,
        schedule: form.type === 'Rush' ? 'ASAP · Dispatch now' : form.schedule,
        type: form.type,
        urgency: form.type === 'Rush' ? 'Urgent' : 'Normal',
        location: jobLocation,
        photo: null,
        media,
        postedBy: ownerUid,
        postedByName: ownerName,
        postedByEmail: auth.user?.email || null,
        postedByMobile: auth.profile?.mobile || null,
      });
      handleClearAllMedia();
      navigate(`/employer/candidates/${jobId}`);
    } catch (err) {
      setError(err.message || 'Could not submit your request. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Request a Service" subtitle="Loading…" />
      </div>
    );
  }

  if (activeJob) {
    return <BlockedByActiveJob activeJob={activeJob} />;
  }

  const mbLimit = MAX_ISSUE_MEDIA_BYTES / (1024 * 1024);
  const homeAddressPreview = formatProfileHomeAddress(auth.profile);

  return (
    <div>
      <PageHeader
        title="Request a Service"
        subtitle="Follow the steps below. Your request is saved to the database and matched to workers by skill and location."
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
        <p className="font-semibold">You don't need to search for workers</p>
        <p className="mt-1 text-gray-600">
          After you submit, qualified workers in Olongapo who have matching skills will see your
          request and can apply. You'll review applicants on the next screen.
        </p>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-5 rounded-xl bg-white p-4 shadow-sm sm:p-5"
      >
        <FormStepper steps={WIZARD_STEPS} currentStep={step} />

        {step === 0 ? (
          <IssueStep
            form={form}
            setForm={setForm}
            profile={auth.profile}
            mediaDrafts={mediaDrafts}
            mediaInputRef={mediaInputRef}
            mbLimit={mbLimit}
            onAddMedia={handleAddMedia}
            onRemoveDraft={handleRemoveDraft}
            onClearAllMedia={handleClearAllMedia}
          />
        ) : null}

        {step === 1 ? (
          <BudgetScheduleStep form={form} setForm={setForm} />
        ) : null}

        {step === 2 ? (
          <ReviewStep
            form={form}
            homeAddress={homeAddressPreview}
            mediaCount={mediaDrafts.length}
            requiredSkills={CATEGORY_REQUIRED_SKILLS[form.category] || []}
          />
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          ) : (
            <span />
          )}
          {step < WIZARD_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#1F4E79] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Continue
              <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-lg bg-[#1F4E79] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function IssueStep({
  form,
  setForm,
  profile,
  mediaDrafts,
  mediaInputRef,
  mbLimit,
  onAddMedia,
  onRemoveDraft,
  onClearAllMedia,
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-[#1F4E79]">Step 1 — Identify the issue</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Category</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          >
            <option value="">Select a category</option>
            {JOB_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Short title</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
            placeholder="e.g. Kitchen faucet replacement"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
            rows={3}
            placeholder="Describe the issue and what you need done..."
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </div>

      <SavedHomeAddressCard profile={profile} />

      <IssueMediaSection
        mediaDrafts={mediaDrafts}
        mediaInputRef={mediaInputRef}
        mbLimit={mbLimit}
        onAddMedia={onAddMedia}
        onRemoveDraft={onRemoveDraft}
        onClearAllMedia={onClearAllMedia}
      />
    </section>
  );
}

function BudgetScheduleStep({ form, setForm }) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-[#1F4E79]">Step 2 — Budget &amp; schedule</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Urgency</label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                type: e.target.value,
                schedule: e.target.value === 'Rush' ? '' : prev.schedule,
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          >
            <option value="Scheduled">Scheduled (plan ahead)</option>
            <option value="Rush">Rush (as soon as possible)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Budget range</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
            value={form.budget}
            onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
          >
            <option value="">Select budget range</option>
            <option>PHP 500 - 1,000</option>
            <option>PHP 1,000 - 2,000</option>
            <option>PHP 2,000 - 3,000</option>
            <option>PHP 3,000 - 5,000</option>
            <option>PHP 5,000+</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">When should work start?</label>
          {form.type === 'Rush' ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <span className="mt-0.5 inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
              <div>
                <p className="text-sm font-semibold text-amber-900">As soon as possible</p>
                <p className="mt-0.5 text-xs text-amber-800/90">
                  Matched workers are notified to apply. Please be home and ready.
                </p>
              </div>
            </div>
          ) : (
            <>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                value={form.schedule}
                onChange={(e) => setForm((prev) => ({ ...prev, schedule: e.target.value }))}
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Workers see this start time when they apply.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewStep({ form, homeAddress, mediaCount, requiredSkills }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[#1F4E79]">Step 3 — Review &amp; submit</h2>
      <p className="text-xs text-gray-500">
        Submitting creates a request in the database with status <strong>Matching</strong>.
        Workers with matching skills can apply.
      </p>
      <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200 text-sm">
        <ReviewRow label="Category" value={form.category} />
        <ReviewRow label="Title" value={form.title} />
        <ReviewRow label="Description" value={form.description} />
        <ReviewRow label="Home address" value={homeAddress} />
        <ReviewRow label="Media" value={`${mediaCount} file(s)`} />
        <ReviewRow label="Budget" value={form.budget} />
        <ReviewRow
          label="Schedule"
          value={form.type === 'Rush' ? 'ASAP' : form.schedule || '—'}
        />
        <ReviewRow label="Skills needed" value={requiredSkills.join(', ') || '—'} />
      </dl>
    </section>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="grid gap-1 px-3 py-2.5 sm:grid-cols-[140px_1fr]">
      <dt className="text-xs font-semibold text-[#1F4E79]">{label}</dt>
      <dd className="text-gray-700">{value || '—'}</dd>
    </div>
  );
}

function IssueMediaSection({
  mediaDrafts,
  mediaInputRef,
  mbLimit,
  onAddMedia,
  onRemoveDraft,
  onClearAllMedia,
}) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-[#1F4E79]">
        Photos / videos of the issue <span className="text-red-500">*</span>
      </h3>
      <p className="mb-3 text-xs text-gray-500">
        Up to {mbLimit} MB per file. Workers use these to assess the job.
      </p>
      {mediaDrafts.length > 0 ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {mediaDrafts.map((draft) => (
              <div
                key={draft.key}
                className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
              >
                <div className="relative bg-black/5">
                  {isVideoMediaEntry({ contentType: draft.file.type }) ? (
                    <video
                      src={draft.previewUrl}
                      controls
                      playsInline
                      className="max-h-56 w-full object-contain"
                    />
                  ) : (
                    <img
                      src={draft.previewUrl}
                      alt=""
                      className="max-h-56 w-full object-contain"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-gray-200 bg-white px-3 py-2">
                  <p className="min-w-0 truncate text-xs text-gray-500">{draft.file.name}</p>
                  <button
                    type="button"
                    onClick={() => onRemoveDraft(draft.key)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#1F4E79] bg-[#1F4E79]/5 px-3 py-2 text-sm font-medium text-[#1F4E79]">
            Add more
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={onAddMedia}
            />
          </label>
          <button
            type="button"
            onClick={onClearAllMedia}
            className="ml-2 inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
            Clear all
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center hover:border-[#1F4E79] hover:bg-blue-50/40">
          <HiOutlinePhoto className="h-8 w-8 text-gray-400" aria-hidden="true" />
          <p className="text-sm font-semibold text-gray-700">Add photos or videos</p>
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={onAddMedia}
          />
        </label>
      )}
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
              Workers expect you at{' '}
              <strong>
                {formatHomeAddress(activeJob.location) || 'your home address'}
              </strong>{' '}
              until this job is done.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <ActiveJobCard job={activeJob} />
      </div>

      <div className="mt-5 rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600 shadow-sm sm:p-5">
        <p>
          Once this job is marked <span className="font-semibold">Completed</span>, you can post a
          new request.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/employer/jobs"
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#1F4E79] px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
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

