import { useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import skills from '../../data/skills.js';

function EmployerPostJobPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    minimumExperience: '',
    certifications: '',
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
    // TODO: Replace with API call to /api/employer/jobs.
    alert('Mock submit successful. Job request stored in local state only.');
  };

  return (
    <div>
      <PageHeader title="Post Job Request" subtitle="Describe your job requirements to receive ranked worker matches." />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Job title"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          required
        />
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          rows={3}
          placeholder="Job description"
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          required
        />

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Required skills</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {skills.map((skill) => {
              const selected = form.requiredSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium ${
                    selected ? 'bg-[#1F4E79] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Minimum experience (optional)"
            value={form.minimumExperience}
            onChange={(event) => setForm((prev) => ({ ...prev, minimumExperience: event.target.value }))}
          />
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Certifications (optional)"
            value={form.certifications}
            onChange={(event) => setForm((prev) => ({ ...prev, certifications: event.target.value }))}
          />
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Budget/payment range"
            value={form.budget}
            onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
            required
          />
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Job location"
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
            required
          />
          <select
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option>Scheduled</option>
            <option>Rush</option>
          </select>
          <input
            type="datetime-local"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={form.schedule}
            onChange={(event) => setForm((prev) => ({ ...prev, schedule: event.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Proof of Issue (optional)</label>
          <input
            type="file"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            onChange={(event) => setForm((prev) => ({ ...prev, proof: event.target.files?.[0]?.name || '' }))}
          />
        </div>

        <button type="submit" className="rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white">
          Submit Job Request
        </button>
      </form>
    </div>
  );
}

export default EmployerPostJobPage;
