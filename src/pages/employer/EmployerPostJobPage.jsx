import { useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import skills from '../../data/skills.js';
import { JOB_CATEGORIES } from '../../data/jobs.js';

function EmployerPostJobPage() {
  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    requiredSkills: [],
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
    alert('Service request submitted. The system will start matching workers and notify you when matches are found.');
  };

  return (
    <div>
      <PageHeader
        title="Request a Service"
        subtitle="Describe what you need. The system will find and notify qualified, available workers automatically."
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
        <p className="font-medium">You don't need to search for workers</p>
        <p className="mt-1 text-gray-600">
          Fill in the details below. The matching engine evaluates worker skills, availability, location, and
          reliability — then pushes your request to the best-fit workers. You'll see ranked matches once workers respond.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Job Type</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Category</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="Scheduled">Scheduled (plan ahead)</option>
                <option value="Rush">Rush (need it soon)</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-gray-600">Short title for this job</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. Kitchen faucet replacement"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Describe the issue, location details, what you need done..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Required Skills</h2>
          <p className="mb-3 text-xs text-gray-500">Select all that apply. This powers the matching engine.</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {skills.map((skill) => {
              const selected = form.requiredSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition ${
                    selected ? 'bg-[#1F4E79] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Schedule &amp; Budget</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Budget range</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
              <label className="mb-1 block text-xs font-medium text-gray-600">Preferred date/time</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={form.schedule}
                onChange={(e) => setForm((prev) => ({ ...prev, schedule: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Job location / address</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. 123 Main St, Quezon City"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Photo of Issue (optional)</h2>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            onChange={(e) => setForm((prev) => ({ ...prev, proof: e.target.files?.[0]?.name || '' }))}
          />
        </section>

        <button type="submit" className="rounded-lg bg-[#1F4E79] px-5 py-2.5 text-sm font-semibold text-white">
          Submit Request
        </button>
      </form>
    </div>
  );
}

export default EmployerPostJobPage;
