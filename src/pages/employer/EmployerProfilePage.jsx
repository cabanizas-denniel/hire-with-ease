import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import VerificationCenter from '../../components/verification/VerificationCenter.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import ProfileHomeLocation from '../../components/profile/ProfileHomeLocation.jsx';
import { buildSavedHomeLocation, locationToPin } from '../../lib/homeLocation.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';

function EmployerProfilePage() {
  const auth = useAuth();
  const userId = auth.user?.uid;

  const [profile, setProfile] = useState({
    name: '',
    mobile: '',
    locationDetails: '',
    preferredContact: 'email',
    bio: '',
    typicalBudget: 'PHP 1,000 - 3,000',
  });
  const [homePin, setHomePin] = useState(null);
  const [homeBarangay, setHomeBarangay] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Avoid an extra Firestore read here — AuthContext already loaded the user doc at login.
    const data = auth.profile || null;
    if (data) {
      setProfile({
        name: data.fullName || auth.user?.fullName || '',
        mobile: data.mobile || '',
        locationDetails: data.locationDetails || '',
        preferredContact: data.preferredContact || 'email',
        bio: data.bio || '',
        typicalBudget: data.typicalBudget || 'PHP 1,000 - 3,000',
      });
      const loadedPin = locationToPin(data.location, data.locationDetails);
      setHomePin(loadedPin ? { lat: loadedPin.lat, lng: loadedPin.lng } : null);
      setHomeBarangay(data.location?.barangay || '');
    } else {
      setProfile((p) => ({ ...p, name: auth.user?.fullName || '' }));
    }
  }, [auth.profile, auth.user?.fullName]);

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!userId) return;
    setBusy(true);
    setStatus(null);
    if (!homePin?.lat || !homePin?.lng) {
      setStatus({
        kind: 'error',
        text: 'Pin your home on the map (tap the map or use current location).',
      });
      setBusy(false);
      return;
    }
    if (!homeBarangay) {
      setStatus({
        kind: 'error',
        text: 'Select your barangay from the dropdown.',
      });
      setBusy(false);
      return;
    }

    try {
      const { location, coords } = buildSavedHomeLocation(
        homePin,
        profile.locationDetails,
        homeBarangay
      );
      await setDoc(
        doc(db, 'users', userId),
        {
          fullName: profile.name,
          mobile: profile.mobile,
          location,
          coords,
          locationDetails: profile.locationDetails,
          preferredContact: profile.preferredContact,
          bio: profile.bio,
          typicalBudget: profile.typicalBudget,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setStatus({ kind: 'ok', text: 'Profile saved.' });
    } catch (err) {
      setStatus({ kind: 'error', text: err.message || 'Could not save profile.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Client Profile"
        subtitle="Verified homeowners get faster matches and priority placement in worker queues."
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
        onSubmit={handleSave}
        className="mt-5 space-y-5 rounded-xl bg-white p-4 shadow-sm sm:p-5"
      >
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">
            Contact Details
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Full name
              </label>
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800">
                {profile.name || '—'}
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
                  This is your account email. Use this in Verification (above).
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
                value={profile.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="For urgent job-day contact only — not used for verification"
              />
            </div>

            <div className="sm:col-span-2">
              <h3 className="mb-2 text-sm font-semibold text-[#1F4E79]">Home address in Olongapo</h3>
              <ProfileHomeLocation
                idPrefix="employer-home"
                pin={homePin}
                onPinChange={setHomePin}
                barangay={homeBarangay}
                onBarangayChange={setHomeBarangay}
                addressDetails={profile.locationDetails}
                onAddressDetailsChange={(value) => handleChange('locationDetails', value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Preferred contact channel
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                value={profile.preferredContact}
                onChange={(e) => handleChange('preferredContact', e.target.value)}
              >
                <option value="email">Email</option>
                <option value="in-app">In-app notifications</option>
                <option value="phone">Phone call / text (your optional number)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Typical budget per job
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                value={profile.typicalBudget}
                onChange={(e) => handleChange('typicalBudget', e.target.value)}
              >
                <option>PHP 500 - 1,000</option>
                <option>PHP 1,000 - 3,000</option>
                <option>PHP 3,000 - 5,000</option>
                <option>PHP 5,000 - 10,000</option>
                <option>PHP 10,000+</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">
            About <span className="font-normal text-gray-400">(optional)</span>
          </h2>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
            placeholder="Tell workers a bit about your home. Longer-term relationships start here."
            value={profile.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
          />
          <p className="mt-1 text-[11px] text-gray-500">
            This snippet appears on job postings so workers know who they will be
            working for.
          </p>
        </section>

        {status ? (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              status.kind === 'error'
                ? 'border border-red-200 bg-red-50 text-red-700'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {status.text}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="cursor-pointer rounded-lg bg-[#1F4E79] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60"
        >
          {busy ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default EmployerProfilePage;
