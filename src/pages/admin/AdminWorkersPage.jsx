import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import SkillBadge from '../../components/SkillBadge.jsx';
import applicants from '../../data/applicants.js';

function AdminWorkersPage() {
  const [filters, setFilters] = useState({ skill: '', location: '', availability: '' });

  const filteredWorkers = useMemo(
    () =>
      applicants.filter((worker) => {
        const bySkill = filters.skill ? worker.skills.includes(filters.skill) : true;
        const byLocation = filters.location
          ? worker.location.toLowerCase().includes(filters.location.toLowerCase())
          : true;
        const byAvailability = filters.availability
          ? worker.availability.some((slot) => slot.toLowerCase().includes(filters.availability.toLowerCase()))
          : true;

        return bySkill && byLocation && byAvailability;
      }),
    [filters]
  );

  return (
    <div>
      <PageHeader
        title="Registered Workers"
        subtitle="Filter applicants by skill, location, and availability for LGU-PESO validation."
      />

      <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-3">
        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Filter by skill"
          value={filters.skill}
          onChange={(event) => setFilters((prev) => ({ ...prev, skill: event.target.value }))}
        />
        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Filter by location"
          value={filters.location}
          onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
        />
        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Filter by availability (Mon/AM)"
          value={filters.availability}
          onChange={(event) => setFilters((prev) => ({ ...prev, availability: event.target.value }))}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {filteredWorkers.map((worker) => (
          <article key={worker.id} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-base font-semibold text-[#1F4E79]">{worker.name}</p>
            <p className="text-sm text-gray-600">{worker.location}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {worker.skills.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Skills</th>
              <th className="px-4 py-3">Availability</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkers.map((worker) => (
              <tr key={worker.id} className="border-t border-gray-100 align-top">
                <td className="px-4 py-3 font-medium text-[#1F4E79]">{worker.name}</td>
                <td className="px-4 py-3">{worker.location}</td>
                <td className="px-4 py-3">{worker.experienceLevel}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {worker.skills.map((skill) => (
                      <SkillBadge key={skill} skill={skill} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">{worker.availability.slice(0, 3).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminWorkersPage;
