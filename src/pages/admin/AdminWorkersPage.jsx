import { useMemo, useState } from 'react';
import { HiOutlineArrowUturnLeft, HiOutlineFlag, HiOutlineNoSymbol } from 'react-icons/hi2';
import AvailabilityGrid from '../../components/AvailabilityGrid.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import SkillBadge from '../../components/SkillBadge.jsx';
import { useWorkerModeration } from '../../context/WorkerModerationContext.jsx';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  flagged: 'bg-amber-100 text-amber-800',
  banned: 'bg-red-100 text-red-800',
};

function StatusBadge({ status }) {
  const label = status === 'active' ? 'Active' : status === 'flagged' ? 'Flagged' : 'Banned';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] || STATUS_STYLES.active}`}>
      {label}
    </span>
  );
}

const ACTION_BUTTON_BASE =
  'inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.98]';

const ACTION_VARIANTS = {
  flag:
    'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:border-amber-300 focus-visible:ring-amber-400',
  ban:
    'border-red-200 bg-red-50 text-red-800 hover:bg-red-100 hover:border-red-300 focus-visible:ring-red-400',
  restore:
    'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 focus-visible:ring-emerald-400',
};

function ModerationActions({ worker, onFlag, onBan, onRestore }) {
  const s = worker.moderationStatus || 'active';
  return (
    <div className="flex flex-wrap gap-2">
      {s !== 'flagged' && s !== 'banned' ? (
        <button
          type="button"
          title="Flag this worker for review"
          aria-label={`Flag ${worker.name} for review`}
          className={`${ACTION_BUTTON_BASE} ${ACTION_VARIANTS.flag}`}
          onClick={() => onFlag(worker.id)}
        >
          <HiOutlineFlag className="h-4 w-4" aria-hidden="true" />
          Flag
        </button>
      ) : null}
      {s !== 'banned' ? (
        <button
          type="button"
          title="Ban this worker from matching"
          aria-label={`Ban ${worker.name} from matching`}
          className={`${ACTION_BUTTON_BASE} ${ACTION_VARIANTS.ban}`}
          onClick={() => onBan(worker.id)}
        >
          <HiOutlineNoSymbol className="h-4 w-4" aria-hidden="true" />
          Ban
        </button>
      ) : null}
      {s !== 'active' ? (
        <button
          type="button"
          title="Restore this worker to active status"
          aria-label={`Restore ${worker.name} to active`}
          className={`${ACTION_BUTTON_BASE} ${ACTION_VARIANTS.restore}`}
          onClick={() => onRestore(worker.id)}
        >
          <HiOutlineArrowUturnLeft className="h-4 w-4" aria-hidden="true" />
          Restore
        </button>
      ) : null}
    </div>
  );
}

function AdminWorkersPage() {
  const { workers, setModerationStatus } = useWorkerModeration();
  const [filters, setFilters] = useState({ skill: '', location: '', availability: '', status: '' });

  const filteredWorkers = useMemo(
    () =>
      workers.filter((worker) => {
        const bySkill = filters.skill ? worker.skills.includes(filters.skill) : true;
        const byLocation = filters.location
          ? worker.location.toLowerCase().includes(filters.location.toLowerCase())
          : true;
        const byAvailability = filters.availability
          ? worker.availability.some((slot) => slot.toLowerCase().includes(filters.availability.toLowerCase()))
          : true;
        const st = worker.moderationStatus || 'active';
        const byStatus = filters.status ? st === filters.status : true;

        return bySkill && byLocation && byAvailability && byStatus;
      }),
    [workers, filters]
  );

  const handleFlag = (id) => setModerationStatus(id, 'flagged');
  const handleBan = (id) => setModerationStatus(id, 'banned');
  const handleRestore = (id) => setModerationStatus(id, 'active');

  return (
    <div>
      <PageHeader
        title="Registered Workers"
        subtitle="LGU-PESO validation, moderation, and workforce registry. Flag accounts for review; banned workers are removed from employer matching."
      />

      <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          placeholder="Filter by skill"
          value={filters.skill}
          onChange={(event) => setFilters((prev) => ({ ...prev, skill: event.target.value }))}
        />
        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          placeholder="Filter by location"
          value={filters.location}
          onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
        />
        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          placeholder="Filter by availability (Mon/AM)"
          value={filters.availability}
          onChange={(event) => setFilters((prev) => ({ ...prev, availability: event.target.value }))}
        />
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          value={filters.status}
          onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="flagged">Flagged</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      <div className="space-y-3 md:hidden">
        {filteredWorkers.map((worker) => (
          <article key={worker.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-[#1F4E79]">{worker.name}</p>
                <p className="text-sm text-gray-600">{worker.location}</p>
                <p className="mt-1 text-sm text-gray-600">
                  ★ {worker.rating} · {worker.yearsExperience} yrs
                </p>
              </div>
              <StatusBadge status={worker.moderationStatus || 'active'} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {worker.skills.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
            <div className="mt-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Availability
              </p>
              <AvailabilityGrid availability={worker.availability} size="md" />
            </div>
            <div className="mt-3 border-t border-gray-100 pt-3">
              <ModerationActions worker={worker} onFlag={handleFlag} onBan={handleBan} onRestore={handleRestore} />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Skills</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkers.map((worker) => (
              <tr key={worker.id} className="border-t border-gray-100 align-top">
                <td className="px-4 py-3 font-medium text-[#1F4E79]">{worker.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={worker.moderationStatus || 'active'} />
                </td>
                <td className="px-4 py-3">{worker.location}</td>
                <td className="px-4 py-3">
                  ★ {worker.rating} <span className="text-gray-500">· {worker.yearsExperience} yrs</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {worker.skills.map((skill) => (
                      <SkillBadge key={skill} skill={skill} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <AvailabilityGrid availability={worker.availability} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <ModerationActions worker={worker} onFlag={handleFlag} onBan={handleBan} onRestore={handleRestore} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminWorkersPage;
