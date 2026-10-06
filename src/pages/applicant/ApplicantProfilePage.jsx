import { useEffect, useMemo, useRef, useState } from 'react';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheckCircle } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import FormStepper from '../../components/FormStepper.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import VerificationCenter from '../../components/verification/VerificationCenter.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import CertificationUploadPanel from '../../components/profile/CertificationUploadPanel.jsx';
import ProfileHomeLocation from '../../components/profile/ProfileHomeLocation.jsx';
import skills, {
  MAX_SECONDARY_SKILLS,
  buildSkillsPayload,
  normalizeWorkerSkills,
} from '../../data/skills.js';
import {
  buildSavedHomeLocation,
  formatCoordsLabel,
  locationToPin,
} from '../../lib/homeLocation.js';
import { useWorkerProfile } from '../../lib/matching/hooks.js';
import { saveWorkerProfile } from '../../lib/matching/workerProfile.js';

const WIZARD_STEPS = ['Skills', 'Location & details', 'Review & save'];

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
    if (!form.primarySkill) {
      return 'Select the primary skill that best represents the work you do.';
    }
    if ((form.secondarySkills || []).length > MAX_SECONDARY_SKILLS) {
      return `Select up to ${MAX_SECONDARY_SKILLS} additional skills.`;
    }
    if ((form.secondarySkills || []).includes(form.primarySkill)) {
      return 'Your primary skill cannot also be listed as an additional skill.';
    }
  }
  if (stepIndex === 1) {
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
    primarySkill: '',
    secondarySkills: [],
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
    const normalized = normalizeWorkerSkills(profile);
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
      primarySkill: normalized.primarySkill || '',
      secondarySkills: normalized.secondarySkills || [],
    });
  }, [profile, auth?.user?.fullName]);

  useEffect(() => {
    if (!error && !success) return;
    statusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [error, success]);

  const sortedSkills = useMemo(() => [...skills].sort((a, b) => a.localeCompare(b)), []);

  const setPrimarySkill = (skill) => {
    setForm((prev) => {
      const nextPrimary = prev.primarySkill === skill ? '' : skill;
      const secondarySkills = (prev.secondarySkills || []).filter((s) => s !== nextPrimary);
      return { ...prev, primarySkill: nextPrimary, secondarySkills };
    });
  };

  const toggleSecondarySkill = (skill) => {
    setForm((prev) => {
      if (!prev.primarySkill || skill === prev.primarySkill) return prev;
      const selected = new Set(prev.secondarySkills || []);
      if (selected.has(skill)) {
        selected.delete(skill);
      } else if (selected.size >= MAX_SECONDARY_SKILLS) {
        return prev;
      } else {
        selected.add(skill);
      }
      return { ...prev, secondarySkills: Array.from(selected) };
    });
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
    const msg = validateStep(0, form) || validateStep(1, form);
    if (msg) {
      setError(msg);
      setStep(validateStep(0, form) ? 0 : 1);
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
      const skillsPayload = buildSkillsPayload(form.primarySkill, form.secondarySkills);
      await saveWorkerProfile(workerUid, {
        name: form.fullName || auth?.user?.fullName,
        ...skillsPayload,
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
          Clients never browse worker lists. The system uses your <strong>primary skill</strong>,{' '}
          <strong>additional skills</strong>, and <strong>map pin</strong> to push relevant jobs.
          Final start time and price are agreed in chat after you accept. Complete every step and
          save on the last step.
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
              primarySkill={form.primarySkill}
              secondarySkills={form.secondarySkills}
              certifications={form.certifications}
              onSelectPrimary={setPrimarySkill}
              onToggleSecondary={toggleSecondarySkill}
              onAddCertifications={handleAddCertifications}
              onRemoveCertification={removeCertificationAt}
              busy={busy}
            />
          ) : null}

          {step === 1 ? (
            <LocationDetailsStep auth={auth} form={form} setForm={setForm} />
          ) : null}

          {step === 2 ? (
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

function SkillChip({ skill, active, disabled = false, onClick, variant = 'default' }) {
  const activeClass =
    variant === 'primary'
      ? 'bg-[#1F4E79] text-white ring-2 ring-[#1F4E79]/30'
      : 'bg-[#2E75B6] text-white';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`cursor-pointer rounded-lg px-2 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? activeClass : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {skill}
    </button>
  );
}

function SkillsStep({
  sortedSkills,
  primarySkill,
  secondarySkills,
  certifications,
  onSelectPrimary,
  onToggleSecondary,
  onAddCertifications,
  onRemoveCertification,
  busy,
}) {
  const secondaryCount = secondarySkills?.length || 0;
  const secondaryAtMax = secondaryCount >= MAX_SECONDARY_SKILLS;
  const additionalOptions = sortedSkills.filter((s) => s !== primarySkill);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-[#1F4E79]">Step 1 — Primary Skill</h2>
        <p className="mt-1 text-xs text-gray-500">
          Select the primary skill that best represents the work you do.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {sortedSkills.map((skill) => (
            <SkillChip
              key={`primary-${skill}`}
              skill={skill}
              active={primarySkill === skill}
              variant="primary"
              onClick={() => onSelectPrimary(skill)}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {primarySkill ? (
            <>
              Primary: <span className="font-semibold text-[#1F4E79]">{primarySkill}</span>
            </>
          ) : (
            'Choose exactly one primary skill to continue.'
          )}
        </p>
      </div>

      <div
        className={`rounded-xl border p-4 transition ${
          primarySkill
            ? 'border-[#2E75B6]/25 bg-[#2E75B6]/5'
            : 'border-gray-100 bg-gray-50 opacity-70'
        }`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#1F4E79]">Step 2 — Additional Skills</h2>
            <p className="mt-1 text-xs text-gray-500">
              Select up to {MAX_SECONDARY_SKILLS} additional skills you can perform.
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              secondaryAtMax
                ? 'bg-[#1F4E79] text-white'
                : 'bg-white text-[#1F4E79] ring-1 ring-[#1F4E79]/20'
            }`}
          >
            {secondaryCount}/{MAX_SECONDARY_SKILLS} selected
          </span>
        </div>

        {!primarySkill ? (
          <p className="mt-3 text-xs text-amber-800">
            Select a primary skill first. Additional skills become available after that.
          </p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {additionalOptions.map((skill) => {
                const active = secondarySkills.includes(skill);
                const disabled = !active && secondaryAtMax;
                return (
                  <SkillChip
                    key={`secondary-${skill}`}
                    skill={skill}
                    active={active}
                    disabled={disabled}
                    onClick={() => onToggleSecondary(skill)}
                  />
                );
              })}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Optional — your primary skill is excluded here. Deselect one to pick another when at
              the limit.
            </p>
          </>
        )}
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
        <h2 className="text-sm font-semibold text-[#1F4E79]">Certifications</h2>
        <p className="mt-1 text-xs text-gray-500">
          Add any certifications or licenses relevant to your work.
        </p>
        <div className="mt-3">
          <CertificationUploadPanel
            certifications={certifications}
            onAddFiles={onAddCertifications}
            onRemoveAt={onRemoveCertification}
            busy={busy}
          />
        </div>
      </div>
    </section>
  );
}

function LocationDetailsStep({ auth, form, setForm }) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-[#1F4E79]">Step 2 — Location &amp; details</h2>
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
              Your primary skill, location, and certifications are stored. The matching engine can
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
  const secondaryLabel = form.secondarySkills?.length
    ? form.secondarySkills.join(', ')
    : 'None';

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[#1F4E79]">Step 3 — Review &amp; save</h2>
      <p className="text-xs text-gray-500">
        Check everything below, then press <strong>Save profile</strong>. Confirmation appears right
        below this summary.
      </p>
      <dl
        className={`divide-y divide-gray-100 rounded-lg border text-sm ${
          saved ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200'
        }`}
      >
        <ReviewRow label="Primary skill" value={form.primarySkill || '—'} />
        <ReviewRow label="Additional skills" value={secondaryLabel} />
        <ReviewRow
          label="Certifications"
          value={
            form.certifications?.length
              ? `${form.certifications.length} file(s)`
              : 'None uploaded'
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
