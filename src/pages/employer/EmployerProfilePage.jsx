import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import VerificationCenter from '../../components/verification/VerificationCenter.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import clientsSeed from '../../data/clients.js';
import { getCurrentUserId } from '../../utils/currentUser.js';

function EmployerProfilePage() {
  const auth = useAuth();
  const verificationUserId = getCurrentUserId(auth);

  const seed = useMemo(() => {
    if (!verificationUserId) return null;
    return clientsSeed.find((c) => c.id === verificationUserId) || null;
  }, [verificationUserId]);

  const [profile, setProfile] = useState(() => ({
    name: seed?.name || 'Maria Santos',
    mobile: seed?.mobile || '',
    email: seed?.email || '',
    location: seed?.location || 'Mabayuan',
    locationDetails: '',
    preferredContact: seed?.email ? 'email' : 'mobile',
    bio:
      'I own a small two-story residence in Mabayuan. I book vetted workers through PESO for routine maintenance and occasional renovations.',
    typicalBudget: 'PHP 1,000 - 3,000',
  }));

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <PageHeader
        title="Client Profile"
        subtitle="Verified homeowners get faster matches and priority placement in worker queues."
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
        <p className="font-medium">Why verification matters</p>
        <p className="mt-1 text-gray-600">
          Workers can see your trust tier before accepting a job. A verified
          profile builds confidence, reduces no-shows, and unlocks larger-budget
          requests.
        </p>
      </div>

      {verificationUserId ? (
        <VerificationCenter
          userId={verificationUserId}
          role="client"
          className="mt-5"
        />
      ) : null}

      <form
        onSubmit={(e) => e.preventDefault()}
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
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Mobile number
              </label>
              <input
                type="tel"
                inputMode="tel"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                value={profile.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Email <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                value={profile.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Address / service location
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                placeholder="e.g. Mabayuan, Olongapo City"
                value={profile.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
              <div className="mt-2 border-l-2 border-gray-200 pl-3">
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Additional location details{' '}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="House/unit no., floor, gate code, landmark, or directions workers should know."
                  value={profile.locationDetails}
                  onChange={(e) =>
                    handleChange('locationDetails', e.target.value)
                  }
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Only shared with workers you accept for a job.
                </p>
              </div>
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
                <option value="mobile">SMS / Call</option>
                <option value="email">Email</option>
                <option value="in-app">In-app notifications</option>
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

        {seed ? (
          <section className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
            <p>
              <span className="font-semibold text-gray-700">Member since:</span>{' '}
              {formatDate(seed.memberSince)}
              <span className="mx-2 text-gray-300">·</span>
              <span className="font-semibold text-gray-700">
                Jobs posted:
              </span>{' '}
              {seed.totalJobsPosted ?? 0}
            </p>
          </section>
        ) : null}

        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-[#1F4E79] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110"
        >
          Save Profile
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
