import { useEffect, useRef, useState } from 'react';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheckCircle } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import FormStepper from '../../components/FormStepper.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import VerificationCenter from '../../components/verification/VerificationCenter.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import ProfileHomeLocation from '../../components/profile/ProfileHomeLocation.jsx';
import {
  buildSavedHomeLocation,
  formatCoordsLabel,
  locationToPin,
} from '../../lib/homeLocation.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';

const WIZARD_STEPS = ['Contact', 'Home location', 'Preferences & about', 'Review & save'];

function validateStep(stepIndex, form) {
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

function EmployerProfilePage() {
  const auth = useAuth();
  const userId = auth.user?.uid;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    locationDetails: '',
    bio: '',
    typicalBudget: 'PHP 1,000 - 3,000',
    homePin: null,
    homeBarangay: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const statusRef = useRef(null);

  useEffect(() => {
    const data = auth.profile || null;
    if (data) {
      const loadedPin = locationToPin(data.location, data.locationDetails);
      setForm({
        name: data.fullName || auth.user?.fullName || '',
        mobile: data.mobile || '',
        locationDetails: data.locationDetails || '',
        bio: data.bio || '',
        typicalBudget: data.typicalBudget || 'PHP 1,000 - 3,000',
        homePin: loadedPin ? { lat: loadedPin.lat, lng: loadedPin.lng } : null,
        homeBarangay: data.location?.barangay || '',
      });
    } else {
      setForm((prev) => ({
        ...prev,
        name: auth.user?.fullName || '',
      }));
    }
  }, [auth.profile, auth.user?.fullName]);

  useEffect(() => {
    if (!error && !success) return;
    statusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [error, success]);

  const clearSaveFeedback = () => {
    setError(null);
    setSuccess(null);
    setProfileSaved(false);
  };

  const goNext = () => {
    const msg = validateStep(step, form);
    if (msg) {
      setError(msg);
      return;
    }
    clearSaveFeedback();
    setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  };

  const goBack = () => {
    clearSaveFeedback();
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!userId) return;

    const msg =
      validateStep(0, form) || validateStep(1, form) || validateStep(2, form);
    if (msg) {
      setError(msg);
      setStep(validateStep(1, form) ? 1 : 0);
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);
    setProfileSaved(false);

    try {
      const { location, coords } = buildSavedHomeLocation(
        form.homePin,
        form.locationDetails,
        form.homeBarangay
      );
      await setDoc(
        doc(db, 'users', userId),
        {
          fullName: form.name,
          mobile: form.mobile,
          location,
          coords,
          locationDetails: form.locationDetails,
          bio: form.bio,
          typicalBudget: form.typicalBudget,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await auth.refreshProfile?.();
      setProfileSaved(true);
      setSuccess('saved');
    } catch (err) {
      setError(err.message || 'Could not save profile.');
    } finally {
      setBusy(false);
    }
  };

  const homeLabel = form.homeBarangay
    ? form.locationDetails.trim()
      ? `${form.locationDetails.trim()} · ${form.homeBarangay}, Olongapo`
      : `${form.homeBarangay}, Olongapo`
    : '—';

  return (
    <div>
      <PageHeader
        title="Client Profile"
        subtitle="Complete each step below. Your home address is used when you post service requests — save on the final step."
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
        <p className="font-semibold">Why verification matters</p>
        <p className="mt-1 text-gray-600">
          Workers can see your trust tier before accepting a job. A verified
          profile builds confidence, reduces no-shows, and unlocks larger-budget
          requests.
        </p>
      </div>

      {auth.user?.uid ? (
        <VerificationCenter
          userId={auth.user.uid}
          role="client"
          className="mt-5"
        />
      ) : null}

      <form
        onSubmit={(event) => event.preventDefault()}
        className="mt-5 space-y-5 rounded-xl bg-white p-4 shadow-sm sm:p-5"
      >
        <FormStepper steps={WIZARD_STEPS} currentStep={step} />

        {step === 0 ? (
          <ContactStep auth={auth} form={form} setForm={setForm} />
        ) : null}

        {step === 1 ? (
          <HomeLocationStep form={form} setForm={setForm} />
        ) : null}

        {step === 2 ? (
          <PreferencesStep form={form} setForm={setForm} />
        ) : null}

        {step === 3 ? (
          <ReviewStep auth={auth} form={form} homeLabel={homeLabel} saved={profileSaved} />
        ) : null}

        {step === WIZARD_STEPS.length - 1 ? (
          <div ref={statusRef} className="scroll-mt-4">
            <ProfileFormStatus
              error={error}
              success={success}
              form={form}
              homeLabel={homeLabel}
              onEditStep={(index) => {
                clearSaveFeedback();
                setStep(index);
              }}
            />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">Please fix this</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : null}

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
              type="button"
              disabled={busy}
              onClick={handleSave}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#1F4E79] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Saving…' : profileSaved ? 'Save again' : 'Save profile'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function ContactStep({ auth, form, setForm }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-[#1F4E79]">Step 1 — Contact</h2>
      <p className="mt-1 text-xs text-gray-500">
        Your account email is shown to workers when they chat with you about a job.
        Add a phone number if you want them to call or text for urgent updates.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Full name
          </label>
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800">
            {form.name || '—'}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Email
          </label>
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800">
            {auth.user?.email || '—'}
          </p>
          {auth?.user?.email ? (
            <p className="mt-1 text-[11px] text-gray-500">
              Shown to workers in chat. Use this email in Verification (above).
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Phone <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="tel"
            inputMode="tel"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
            value={form.mobile}
            onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
            placeholder="+63 9XX XXX XXXX"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Shown to workers in chat when they apply to your jobs.
          </p>
        </div>
      </div>
    </section>
  );
}

function HomeLocationStep({ form, setForm }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-[#1F4E79]">Step 2 — Home location</h2>
      <p className="mt-1 text-xs text-gray-500">
        Pin where you live in Olongapo. This address is reused when you post a
        service request — workers see it on your jobs.
      </p>
      <div className="mt-3">
        <ProfileHomeLocation
          idPrefix="employer-home"
          pin={form.homePin}
          onPinChange={(homePin) => setForm((prev) => ({ ...prev, homePin }))}
          barangay={form.homeBarangay}
          onBarangayChange={(homeBarangay) =>
            setForm((prev) => ({ ...prev, homeBarangay }))
          }
          addressDetails={form.locationDetails}
          onAddressDetailsChange={(locationDetails) =>
            setForm((prev) => ({ ...prev, locationDetails }))
          }
        />
      </div>
    </section>
  );
}

function PreferencesStep({ form, setForm }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[#1F4E79]">
          Step 3 — Preferences &amp; about
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Optional details that help workers understand your typical jobs.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Typical budget per job
        </label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          value={form.typicalBudget}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, typicalBudget: e.target.value }))
          }
        >
          <option>PHP 500 - 1,000</option>
          <option>PHP 1,000 - 3,000</option>
          <option>PHP 3,000 - 5,000</option>
          <option>PHP 5,000 - 10,000</option>
          <option>PHP 10,000+</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          About <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          placeholder="Tell workers a bit about your home."
          value={form.bio}
          onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
        />
        <p className="mt-1 text-[11px] text-gray-500">
          This snippet can appear on job postings so workers know who they will be
          working for.
        </p>
      </div>
    </section>
  );
}

function ReviewStep({ auth, form, homeLabel, saved = false }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[#1F4E79]">Step 4 — Review &amp; save</h2>
      <p className="text-xs text-gray-500">
        Check everything below, then press <strong>Save profile</strong>. Confirmation
        appears right below this summary.
      </p>
      <dl
        className={`divide-y divide-gray-100 rounded-lg border text-sm ${
          saved ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200'
        }`}
      >
        <ReviewRow label="Name" value={form.name || auth?.user?.fullName} />
        <ReviewRow label="Email" value={auth?.user?.email} />
        <ReviewRow label="Phone" value={form.mobile || '—'} />
        <ReviewRow label="Home area" value={homeLabel} />
        <ReviewRow
          label="Map coordinates"
          value={
            formatCoordsLabel(form.homePin)
              ? `${formatCoordsLabel(form.homePin)} (used for your service requests)`
              : '—'
          }
        />
        <ReviewRow
          label="Barangay"
          value={form.homeBarangay ? `${form.homeBarangay}, Olongapo` : '—'}
        />
        <ReviewRow label="Typical budget" value={form.typicalBudget} />
        <ReviewRow label="About" value={form.bio?.trim() || '—'} />
      </dl>
    </section>
  );
}

function ProfileFormStatus({ error, success, form, homeLabel, onEditStep }) {
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
              Your home address and contact details are stored. Workers will see your
              email and phone in chat when they apply to your jobs.
            </p>
            {homeLabel && homeLabel !== '—' ? (
              <p className="mt-2 text-xs text-emerald-700">
                Home: <span className="font-medium">{homeLabel}</span>
              </p>
            ) : null}
            {coordsText ? (
              <p className="mt-1 text-xs text-emerald-700">
                Coordinates: <span className="font-mono">{coordsText}</span>
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/employer/post-job"
                className="inline-flex rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
              >
                Request a service
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

function ReviewRow({ label, value }) {
  return (
    <div className="grid gap-1 px-3 py-2.5 sm:grid-cols-[140px_1fr]">
      <dt className="text-xs font-semibold text-[#1F4E79]">{label}</dt>
      <dd className="text-gray-700">{value || '—'}</dd>
    </div>
  );
}

export default EmployerProfilePage;
