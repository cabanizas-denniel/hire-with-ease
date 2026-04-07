import { useMemo, useState } from 'react';
import AvailabilityPicker from '../../components/AvailabilityPicker.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import skills from '../../data/skills.js';

function ApplicantProfilePage() {
  const [profile, setProfile] = useState({
    fullName: 'Rafael Santos',
    location: 'Quezon City',
    serviceRadius: 'Within 15 km',
    experience: '6 years in plumbing, pipe fitting, and residential maintenance.',
    certifications: 'TESDA NC II - Plumbing',
    selectedSkills: ['Plumbing', 'Pipe Fitting', 'Safety Compliance'],
    availability: ['Mon-AM', 'Tue-AM', 'Wed-AM', 'Thu-AM', 'Fri-AM'],
  });

  const toggleSkill = (skill) => {
    const selected = new Set(profile.selectedSkills);
    if (selected.has(skill)) {
      selected.delete(skill);
    } else {
      selected.add(skill);
    }
    setProfile((prev) => ({ ...prev, selectedSkills: Array.from(selected) }));
  };

  const sortedSkills = useMemo(() => [...skills].sort((a, b) => a.localeCompare(b)), []);

  return (
    <div>
      <PageHeader
        title="Service Profile"
        subtitle="Your profile powers the matching engine. The more complete it is, the better your matches."
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
        <p className="font-medium">Why this matters</p>
        <p className="mt-1 text-gray-600">
          Clients never browse worker lists. The system reads your skills, availability, and location to push
          relevant jobs to you automatically. Incomplete profiles get fewer matches.
        </p>
      </div>

      <form className="mt-5 space-y-5 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Availability</h2>
          <p className="mb-3 text-xs text-gray-500">
            This is the most important part. Jobs are matched against your open time slots first.
          </p>
          <AvailabilityPicker
            value={profile.availability}
            onChange={(availability) => setProfile((prev) => ({ ...prev, availability }))}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Skills</h2>
          <p className="mb-3 text-xs text-gray-500">
            Select every skill you can perform. More skills = broader matches.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {sortedSkills.map((skill) => {
              const active = profile.selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition ${
                    active ? 'bg-[#1F4E79] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Personal Details</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Full Name</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={profile.fullName}
                onChange={(e) => setProfile((prev) => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Location</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={profile.location}
                onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Service Radius</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={profile.serviceRadius}
                onChange={(e) => setProfile((prev) => ({ ...prev, serviceRadius: e.target.value }))}
              >
                <option>Within 5 km</option>
                <option>Within 10 km</option>
                <option>Within 15 km</option>
                <option>Within 25 km</option>
                <option>Anywhere in Metro Manila</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Experience &amp; Certifications</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Work experience</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={profile.experience}
                onChange={(e) => setProfile((prev) => ({ ...prev, experience: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Certifications (optional)</label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={profile.certifications}
                onChange={(e) => setProfile((prev) => ({ ...prev, certifications: e.target.value }))}
              />
            </div>
          </div>
        </section>

        <button type="button" className="rounded-lg bg-[#1F4E79] px-5 py-2.5 text-sm font-semibold text-white">
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default ApplicantProfilePage;
