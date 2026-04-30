import { useMemo, useRef, useState } from 'react';
import {
  HiOutlineExclamationTriangle,
  HiOutlineMapPin,
  HiOutlinePhoto,
  HiOutlineTrash,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { Link, useNavigate } from 'react-router-dom';
import ActiveJobCard from '../../components/employer/ActiveJobCard.jsx';
import LocationPicker from '../../components/maps/LocationPicker.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { CATEGORY_REQUIRED_SKILLS, JOB_CATEGORIES } from '../../data/jobs.js';
import { storage } from '../../lib/firebase.js';
import {
  assertIssueMediaFile,
  MAX_ISSUE_MEDIA_BYTES,
  uploadJobIssueFiles,
} from '../../lib/jobIssueMediaUpload.js';
import { createJob, findActiveJob, newJobId } from '../../lib/matching/jobs.js';
import { useJobsByOwner } from '../../lib/matching/hooks.js';
import { isVideoMediaEntry } from '../../utils/jobMedia.js';

function EmployerPostJobPage() {
  const auth = useAuth();
  const ownerUid = auth?.user?.uid || null;
  const ownerName = auth?.user?.fullName || null;

  const { data: myJobs, loading } = useJobsByOwner(ownerUid);
  const activeJob = useMemo(() => findActiveJob(myJobs), [myJobs]);

  const mediaInputRef = useRef(null);

  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    budget: '',
    locationPin: null,
    addressDetails: '',
    type: 'Scheduled',
    schedule: '',
  });

  /** Local picks before upload: { key, file, previewUrl } */
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!ownerUid) {
      setError('You need to be signed in to post a job.');
      return;
    }
    const requiredSkills = CATEGORY_REQUIRED_SKILLS[form.category];
    if (!requiredSkills?.length) {
      setError('Pick a category so we can match the right workers.');
      return;
    }
    if (!form.locationPin) {
      setError('Drop a pin on the map at your exact address — workers need to know where to go.');
      return;
    }
    if (!form.addressDetails.trim()) {
      setError('Add address details (street, unit, gate code, landmark) so the worker can find your home.');
      return;
    }
    if (mediaDrafts.length === 0) {
      setError('Add at least one photo or video of the issue so applicants can quote accurately.');
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
        schedule: form.schedule,
        type: form.type,
        urgency: form.type === 'Rush' ? 'Urgent' : 'Normal',
        location: {
          lat: form.locationPin.lat,
          lng: form.locationPin.lng,
          barangay: form.locationPin.barangay,
          label: form.addressDetails.trim(),
        },
        photo: null,
        media,
        postedBy: ownerUid,
        postedByName: ownerName,
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

  return (
    <div>
      <PageHeader
        title="Request a Service"
        subtitle="Describe what you need. The system will find and notify qualified, available workers automatically."
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
        <p className="font-semibold">You don't need to search for workers</p>
        <p className="mt-1 text-gray-600">
          Fill in the details below. The matching engine evaluates worker skills, availability, location, and
          reliability — then pushes your request to the best-fit workers. You'll see ranked matches once workers respond.
        </p>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

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
                {form.type === 'Rush' ? '' : 'Scheduled start date & time'}
              </label>
              {form.type === 'Rush' ? (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <span className="mt-0.5 inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-amber-900">Dispatch now</p>
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
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-sm font-semibold text-[#1F4E79]">
            Job Location <span className="text-red-500">*</span>
          </h2>
          <p className="mb-3 text-xs text-gray-500">
            Drop a pin on your exact address so the worker can navigate
            directly to your home. Tap the map, or use your current location.
          </p>

          <LocationPicker
            value={form.locationPin}
            onChange={(locationPin) =>
              setForm((prev) => ({ ...prev, locationPin }))
            }
          />

          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Address details <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
              placeholder="Street, house/unit no., gate code, landmark, or directions a worker would need."
              value={form.addressDetails}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, addressDetails: e.target.value }))
              }
              required
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Only shared with workers you accept; combined with the pin so the
              worker arrives at the right house, not just the right barangay.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-sm font-semibold text-[#1F4E79]">
            Photos / videos of the issue <span className="text-red-500">*</span>
          </h2>
          <p className="mb-3 text-xs text-gray-500">
            Add one or more clips or pictures so applicants can assess scope and quote fairly. Each file can be up to{' '}
            {mbLimit} MB.
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
                      {isVideoMediaEntry({
                        contentType: draft.file.type,
                      }) ? (
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
                      <p className="min-w-0 truncate text-xs text-gray-500">
                        {draft.file.name} · {(draft.file.size / 1024).toFixed(0)} KB
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveDraft(draft.key)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#1F4E79] bg-[#1F4E79]/5 px-3 py-2 text-sm font-medium text-[#1F4E79] hover:bg-[#1F4E79]/10">
                  Add more
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleAddMedia}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleClearAllMedia}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
                  Clear all
                </button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition hover:border-[#1F4E79] hover:bg-blue-50/40">
              <HiOutlinePhoto className="h-8 w-8 text-gray-400" aria-hidden="true" />
              <p className="text-sm font-semibold text-gray-700">Add photos or videos</p>
              <p className="text-[11px] text-gray-500">
                Images or videos, multiple files OK — up to {mbLimit} MB each.
              </p>
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleAddMedia}
              />
            </label>
          )}
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#1F4E79] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit Request'}
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
                  <strong>{activeJob.location?.label || activeJob.location?.barangay || 'your job site'}</strong> until this job is done.
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
