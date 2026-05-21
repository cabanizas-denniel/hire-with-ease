import { useEffect, useMemo, useRef, useState } from 'react';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheckCircle } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import AvailabilityPicker from '../../components/AvailabilityPicker.jsx';
import FormStepper from '../../components/FormStepper.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import VerificationCenter from '../../components/verification/VerificationCenter.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import CertificationUploadPanel from '../../components/profile/CertificationUploadPanel.jsx';
import ProfileHomeLocation from '../../components/profile/ProfileHomeLocation.jsx';
import skills from '../../data/skills.js';
import {
  buildSavedHomeLocation,
  formatCoordsLabel,
  locationToPin,
} from '../../lib/homeLocation.js';
import { useWorkerProfile } from '../../lib/matching/hooks.js';
import { saveWorkerProfile } from '../../lib/matching/workerProfile.js';

const WIZARD_STEPS = ['Skills', 'Availability', 'Location & details', 'Review & save'];

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}

function validateStep(stepIndex, form) {
  if (stepIndex === 0) {
    if (!form.selectedSkills?.length) return 'Select at least one skill you can perform.';
  }
  if (stepIndex === 1) {
    if (!form.availability?.length) return 'Select at least one availability time slot.';
  }
  if (stepIndex === 2) {
    if (!form.homePin?.lat || !form.homePin?.lng) {
      return 'Pin your home on the map (tap the map or use current location).';
    }
    if (!form.homeBarangay) {
      return 'Select your barangay from the dropdown to confirm where you live.';
    }
  }
  return null;
}

function ApplicantProfilePage() {
  const auth = useAuth();
  const workerUid = auth?.user?.uid || null;
  const { data: profile, loading } = useWorkerProfile(workerUid);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: '',
    homePin: null,
    homeBarangay: '',
    addressDetails: '',
    certifications: [],
    selectedSkills: [],
    availability: [],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const statusRef = useRef(null);

  useEffect(() => {
    if (!profile) return;
    const certs = Array.isArray(profile.certifications) ? profile.certifications : [];
    const loadedPin = locationToPin(profile.location, profile.addressDetails);
    setForm({
      fullName: profile.name || auth?.user?.fullName || '',
      homePin: loadedPin ? { lat: loadedPin.lat, lng: loadedPin.lng } : null,
      homeBarangay: profile.location?.barangay || '',
      addressDetails:
        profile.addressDetails ||
        (profile.location?.label && profile.location?.label !== profile.location?.barangay
          ? profile.location.label
          : '') ||
        '',
      certifications: certs.map((c) =>
        typeof c === 'string'
          ? { label: c, fileData: null, uploadedAt: null }
          : {
              label: c?.label || c?.name || 'Certification',
              fileData: c?.fileData ?? null,
              uploadedAt: c?.uploadedAt ?? null,
            }
      ),
      selectedSkills: profile.skills || [],
      availability: profile.availability || [],
    });
  }, [profile, auth?.user?.fullName]);

  useEffect(() => {
    if (!error && !success) return;
    statusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [error, success]);

  const sortedSkills = useMemo(() => [...skills].sort((a, b) => a.localeCompare(b)), []);

  const toggleSkill = (skill) => {
    const selected = new Set(form.selectedSkills);
    if (selected.has(skill)) {
      selected.delete(skill);
    } else {
      selected.add(skill);
    }
    setForm((prev) => ({ ...prev, selectedSkills: Array.from(selected) }));
  };

  const handleAddCertifications = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setError(null);
    const maxBytes = 4 * 1024 * 1024;
    try {
      const entries = await Promise.all(
        files.map(async (file) => {
          if (file.size > maxBytes) {
            throw new Error(
              `${file.name || 'File'} is too large. Use a file under 4 MB or a smaller photo.`
            );
          }
          const dataUrl = await readAsDataUrl(file);
          return {
            label: file.name || 'Certification',
            fileData: dataUrl,
            uploadedAt: new Date().toISOString(),
          };
        })
      );
      setForm((prev) => ({ ...prev, certifications: [...prev.certifications, ...entries] }));
    } catch (err) {
      setError(err.message || 'Could not attach certification.');
    }
  };

  const removeCertificationAt = (index) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const goNext = () => {
    const msg = validateStep(step, form);
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

  const handleSave = async (event) => {
    event.preventDefault();
    const msg =
      validateStep(0, form) || validateStep(1, form) || validateStep(2, form);
    if (msg) {
      setError(msg);
      setStep(
        validateStep(0, form) ? 0 : validateStep(1, form) ? 1 : 2
      );
      return;
    }
    if (!workerUid) return;

    setBusy(true);
    setError(null);
    setSuccess(null);
    setProfileSaved(false);
    try {
      const { location, coords } = buildSavedHomeLocation(
        form.homePin,
        form.addressDetails,
        form.homeBarangay
      );
      await saveWorkerProfile(workerUid, {
        name: form.fullName || auth?.user?.fullName,
        skills: form.selectedSkills,
        availability: form.availability,
        certifications: (form.certifications || []).map((c) => ({
          label: c?.label || 'Certification',
          fileData: c?.fileData ?? null,
          uploadedAt: c?.uploadedAt ?? null,
        })),
        addressDetails: form.addressDetails.trim() || null,
        location,
        coords,
      });
      setProfileSaved(true);
      setSuccess('saved');
    } catch (err) {
      setError(err.message || 'Could not save profile.');
    } finally {
      setBusy(false);
    }
  };

  const homeLabel = form.homeBarangay
    ? form.addressDetails.trim()
      ? `${form.addressDetails.trim()} · ${form.homeBarangay}, Olongapo`
      : `${form.homeBarangay}, Olongapo`
    : '—';

  return (
    <div>
      <PageHeader
        title="Service Profile"
        subtitle="Complete each step below. Your profile powers job matching — save when you reach the final step."
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
        <p className="font-medium">Why this matters</p>
        <p className="mt-1 text-gray-600">
          Clients never browse worker lists. The system uses your <strong>skills</strong>,{' '}
          <strong>availability</strong>, and <strong>map pin (latitude & longitude)</strong> to push relevant
          jobs. Complete every step and save on the last step.
        </p>
      </div>

      {workerUid ? (
        <VerificationCenter userId={workerUid} role="service-provider" className="mt-5" />
      ) : null}

      {loading ? (
        <p className="mt-5 rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Loading your profile…
        </p>
      ) : null}

      {!loading ? (
        <form
          onSubmit={handleSave}
          className="mt-5 space-y-5 rounded-xl bg-white p-4 shadow-sm sm:p-5"
        >
          <FormStepper steps={WIZARD_STEPS} currentStep={step} />

          {step === 0 ? (
            <SkillsStep
              sortedSkills={sortedSkills}
              selectedSkills={form.selectedSkills}
              onToggleSkill={toggleSkill}
            />
          ) : null}

          {step === 1 ? (
            <AvailabilityStep
              value={form.availability}
              onChange={(availability) => setForm((prev) => ({ ...prev, availability }))}
            />
          ) : null}

          {step === 2 ? (
            <LocationDetailsStep
              auth={auth}
              form={form}
              setForm={setForm}
              onAddCertifications={handleAddCertifications}
              onRemoveCertification={removeCertificationAt}
              busy={busy}
            />
          ) : null}

          {step === 3 ? (
            <ReviewStep
              auth={auth}
              form={form}
              homeLabel={homeLabel}
              saved={profileSaved}
            />
          ) : null}

          <div ref={statusRef} className="scroll-mt-4">
            <ProfileFormStatus
              error={error}
              success={success}
              form={form}
              onEditStep={setStep}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
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
                className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#1F4E79] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
              >
                Continue
                <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={busy}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#1F4E79] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
              >
                {busy ? 'Saving…' : profileSaved ? 'Save again' : 'Save profile'}
              </button>
            )}
          </div>
        </form>
      ) : null}
    </div>
  );
}

function SkillsStep({ sortedSkills, selectedSkills, onToggleSkill }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-[#1F4E79]">Step 1 — Skills</h2>
      <p className="mt-1 text-xs text-gray-500">
        Select every skill you can perform. Jobs are matched when you share at least one skill with the
        request.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {sortedSkills.map((skill) => {
          const active = selectedSkills.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => onToggleSkill(skill)}
              className={`cursor-pointer rounded-lg px-2 py-2 text-xs font-medium transition ${
                active ? 'bg-[#1F4E79] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {skill}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-gray-500">
        {selectedSkills.length} skill{selectedSkills.length === 1 ? '' : 's'} selected
      </p>
    </section>
  );
}

function AvailabilityStep({ value, onChange }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-[#1F4E79]">Step 2 — Availability</h2>
      <p className="mt-1 text-xs text-gray-500">
        This is the most important part for matching. Jobs are checked against your open time slots first.
      </p>
      <div className="mt-3">
        <AvailabilityPicker value={value} onChange={onChange} />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        {value.length} time slot{value.length === 1 ? '' : 's'} selected
      </p>
    </section>
  );
}

function LocationDetailsStep({
  auth,
  form,
  setForm,
  onAddCertifications,
  onRemoveCertification,
  busy,
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-[#1F4E79]">Step 3 — Location &amp; details</h2>
        <p className="mt-1 text-xs text-gray-500">
          Pin where you are based and confirm your barangay for matching.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Account email</label>
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800">
            {auth?.user?.email || '—'}
          </p>
        </div>
        <div className="sm:col-span-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Full name</label>
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800">
            {auth?.user?.fullName || '—'}
          </p>
        </div>
 
        <div className="sm:col-span-2">
          <ProfileHomeLocation
            idPrefix="worker-home"
            pin={form.homePin}
            onPinChange={(homePin) => setForm((prev) => ({ ...prev, homePin }))}
            barangay={form.homeBarangay}
            onBarangayChange={(homeBarangay) =>
              setForm((prev) => ({ ...prev, homeBarangay }))
            }
            addressDetails={form.addressDetails}
            onAddressDetailsChange={(addressDetails) =>
              setForm((prev) => ({ ...prev, addressDetails }))
            }
          />
        </div>
      </div>


      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
        <h3 className="text-sm font-semibold text-[#1F4E79]">Certifications</h3>
        <p className="mt-1 text-xs text-gray-500">
          Optional — upload proof of training or clearance. Saved with your profile when you finish step 4.
        </p>
        <div className="mt-3">
          <CertificationUploadPanel
            certifications={form.certifications}
            onAddFiles={onAddCertifications}
            onRemoveAt={onRemoveCertification}
            busy={busy}
          />
        </div>
      </div>
    </section>
  );
}

function ProfileFormStatus({ error, success, form, onEditStep }) {
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p className="font-semibold">Could not save</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  if (success === 'saved') {
    const coordsText = formatCoordsLabel(form.homePin);
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <HiOutlineCheckCircle className="h-8 w-8 shrink-0 text-emerald-600" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-emerald-900">Profile saved</p>
            <p className="mt-1 text-sm text-emerald-800">
              Your skills, availability, barangay, and map location are stored. The matching engine can
              now push relevant jobs to you.
            </p>
            {coordsText ? (
              <p className="mt-2 text-xs text-emerald-700">
                Home coordinates saved: <span className="font-mono">{coordsText}</span>
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/applicant/jobs"
                className="inline-flex rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
              >
                View matched jobs
              </Link>
              <button
                type="button"
                onClick={() => onEditStep(0)}
                className="inline-flex cursor-pointer rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100/50"
              >
                Edit profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function ReviewStep({ auth, form, homeLabel, saved = false }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[#1F4E79]">Step 4 — Review &amp; save</h2>
      <p className="text-xs text-gray-500">
        Check everything below, then press <strong>Save profile</strong>. Confirmation appears right
        below this summary.
      </p>
      <dl
        className={`divide-y divide-gray-100 rounded-lg border text-sm ${
          saved ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200'
        }`}
      >
        <ReviewRow label="Skills" value={form.selectedSkills.join(', ') || '—'} />
        <ReviewRow
          label="Availability"
          value={
            form.availability.length
              ? `${form.availability.length} slot(s): ${form.availability.slice(0, 6).join(', ')}${
                  form.availability.length > 6 ? '…' : ''
                }`
              : '—'
          }
        />
        <ReviewRow label="Email" value={auth?.user?.email} />
        <ReviewRow label="Name" value={auth?.user?.fullName} />
        <ReviewRow label="Home area" value={homeLabel} />
        <ReviewRow
          label="Map coordinates"
          value={
            formatCoordsLabel(form.homePin)
              ? `${formatCoordsLabel(form.homePin)} (saved for proximity matching)`
              : '—'
          }
        />
        <ReviewRow
          label="Barangay"
          value={form.homeBarangay ? `${form.homeBarangay}, Olongapo` : '—'}
        />
        <ReviewRow
          label="Certifications"
          value={
            form.certifications?.length
              ? `${form.certifications.length} file(s)`
              : 'None uploaded'
          }
        />
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

export default ApplicantProfilePage;
