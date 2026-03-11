import { useMemo, useState } from 'react';
import AvailabilityPicker from '../../components/AvailabilityPicker.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import skills from '../../data/skills.js';

function ApplicantProfilePage() {
  const [profile, setProfile] = useState({
    fullName: 'Demo Applicant',
    location: 'Quezon City',
    experience: '3 years in plumbing and site maintenance projects.',
    certifications: 'TESDA NC II - Plumbing',
    preferredCategories: 'Residential Repairs, Emergency Services',
    preferredLocation: 'Metro Manila',
    selectedSkills: ['Plumbing', 'Masonry'],
    availability: ['Mon-AM', 'Tue-AM'],
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
        title="Profile Builder"
        subtitle="Complete your profile to improve match recommendations and employer trust."
      />

      <form className="space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={profile.fullName}
            onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
            placeholder="Full name"
          />
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={profile.location}
            onChange={(event) => setProfile((prev) => ({ ...prev, location: event.target.value }))}
            placeholder="Current location"
          />
        </div>

        <textarea
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={profile.experience}
          onChange={(event) => setProfile((prev) => ({ ...prev, experience: event.target.value }))}
          placeholder="Work experience"
        />

        <textarea
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={profile.certifications}
          onChange={(event) => setProfile((prev) => ({ ...prev, certifications: event.target.value }))}
          placeholder="Certifications (optional)"
        />

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Skills</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {sortedSkills.map((skill) => {
              const active = profile.selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium ${
                    active ? 'bg-[#1F4E79] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        <AvailabilityPicker
          value={profile.availability}
          onChange={(availability) => setProfile((prev) => ({ ...prev, availability }))}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={profile.preferredCategories}
            onChange={(event) => setProfile((prev) => ({ ...prev, preferredCategories: event.target.value }))}
            placeholder="Preferred job categories"
          />
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={profile.preferredLocation}
            onChange={(event) => setProfile((prev) => ({ ...prev, preferredLocation: event.target.value }))}
            placeholder="Preferred work location"
          />
        </div>

        <button type="button" className="rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white">
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default ApplicantProfilePage;
