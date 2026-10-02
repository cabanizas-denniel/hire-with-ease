import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import OlongapoMap from '../../components/maps/OlongapoMap.jsx';
import DemandHeatmap from '../../components/maps/DemandHeatmap.jsx';
import {
  useApplications,
  useJobs,
  useWorkerProfiles,
} from '../../lib/useFirestoreData.js';
import { JOB_STATUS } from '../../lib/matching/statuses.js';

const OPEN_JOB_STATUSES = new Set([
  JOB_STATUS.MATCHING,
  JOB_STATUS.MATCHED,
  JOB_STATUS.IN_PROGRESS,
  'Matching',
  'Matched',
  'In Progress',
]);

function weekKey(isoOrTs) {
  if (!isoOrTs) return null;
  const d =
    typeof isoOrTs === 'string'
      ? new Date(isoOrTs)
      : isoOrTs?.toDate
        ? isoOrTs.toDate()
        : isoOrTs?.seconds
          ? new Date(isoOrTs.seconds * 1000)
          : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + mondayOffset);
  return monday.toISOString().slice(0, 10);
}

function formatWeekLabel(key) {
  if (!key) return '';
  const d = new Date(`${key}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ChartEmpty({ message }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 text-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

function AdminDashboardPage() {
  const { data: jobs, loading: jobsLoading, error: jobsError } = useJobs();
  const { data: workers, loading: workersLoading, error: workersError } =
    useWorkerProfiles();
  const { data: applications, loading: appsLoading, error: appsError } =
    useApplications();

  const jobPoints = useMemo(
    () =>
      jobs
        .filter((j) => OPEN_JOB_STATUSES.has(j.status))
        .filter((j) => j?.location?.lat && j?.location?.lng)
        .map((j) => ({ lat: j.location.lat, lng: j.location.lng, weight: 1 })),
    [jobs],
  );

  const workerPoints = useMemo(
    () =>
      workers
        .filter((w) => (w.moderationStatus || 'active') !== 'banned')
        .filter((w) => w?.location?.lat && w?.location?.lng)
        .map((w) => ({ lat: w.location.lat, lng: w.location.lng, weight: 1 })),
    [workers],
  );

  const analytics = useMemo(() => {
    const activeWorkers = workers.filter(
      (w) => (w.moderationStatus || 'active') !== 'banned',
    );
    const activeRequests = jobs.filter((j) => OPEN_JOB_STATUSES.has(j.status));
    const completedJobs = jobs.filter(
      (j) => j.status === JOB_STATUS.COMPLETED || j.status === 'Completed',
    );
    const confirmedJobs = jobs.filter(
      (j) =>
        j.status === JOB_STATUS.CONFIRMED ||
        j.status === JOB_STATUS.IN_PROGRESS ||
        j.status === JOB_STATUS.COMPLETED ||
        j.status === 'Confirmed' ||
        j.status === 'In Progress' ||
        j.status === 'Completed',
    );
    const matchingJobs = jobs.filter(
      (j) =>
        j.status === JOB_STATUS.MATCHING ||
        j.status === JOB_STATUS.MATCHED ||
        j.status === 'Matching' ||
        j.status === 'Matched',
    );

    const skillDemand = {};
    jobs.forEach((j) => {
      (j.requiredSkills || []).forEach((s) => {
        if (!s) return;
        skillDemand[s] = (skillDemand[s] || 0) + 1;
      });
    });
    const skillSupply = {};
    activeWorkers.forEach((w) => {
      (w.skills || []).forEach((s) => {
        if (!s) return;
        skillSupply[s] = (skillSupply[s] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillDemand)
      .map(([skill, demand]) => ({ skill, demand }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 5);

    const weekCounts = {};
    jobs.forEach((j) => {
      const key = weekKey(j.postedAt || j.createdAt);
      if (!key) return;
      weekCounts[key] = (weekCounts[key] || 0) + 1;
    });
    const requestTrend = Object.keys(weekCounts)
      .sort()
      .slice(-12)
      .map((key) => ({
        week: formatWeekLabel(key),
        requests: weekCounts[key],
      }));

    const shortages = Object.keys(skillDemand)
      .map((skill) => {
        const demand = skillDemand[skill] || 0;
        const supply = skillSupply[skill] || 0;
        if (demand === 0) return null;
        if (supply === 0) {
          return { skill, level: 'Critical', region: 'Olongapo City', demand, supply };
        }
        if (supply < demand) {
          return { skill, level: 'Watch', region: 'Olongapo City', demand, supply };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.demand - a.demand - (a.supply - b.supply))
      .slice(0, 8);

    const shortlistSizes = jobs
      .map((j) =>
        Array.isArray(j.engineMatches)
          ? j.engineMatches.length
          : Array.isArray(j.matchedWorkers)
            ? j.matchedWorkers.length
            : null,
      )
      .filter((n) => typeof n === 'number');
    const avgShortlist =
      shortlistSizes.length > 0
        ? (
            shortlistSizes.reduce((a, b) => a + b, 0) / shortlistSizes.length
          ).toFixed(1)
        : '—';

    const rated = activeWorkers.filter(
      (w) => typeof w.rating === 'number' && w.rating > 0,
    );
    const avgRating =
      rated.length > 0
        ? (
            rated.reduce((a, w) => a + w.rating, 0) / rated.length
          ).toFixed(1)
        : '—';

    const acceptedApps = applications.filter(
      (a) =>
        a.status === 'confirmed' ||
        a.status === 'completed' ||
        a.status === 'proposed',
    );
    const totalApps = applications.length;
    const acceptanceRate =
      totalApps > 0
        ? `${Math.round((acceptedApps.length / totalApps) * 100)}%`
        : '—';

    const completionRate =
      jobs.length > 0
        ? `${Math.round((completedJobs.length / jobs.length) * 100)}%`
        : '—';

    const confirmedVsMatching =
      matchingJobs.length + confirmedJobs.length > 0
        ? `${confirmedJobs.length} confirmed / ${matchingJobs.length} matching`
        : '—';

    const w = activeWorkers.length;
    const r = activeRequests.length;
    const ratio = r === 0 ? `${w} : 0` : `${w} : ${r}`;

    return {
      topSkills,
      requestTrend,
      shortages,
      ratios: {
        workers: w,
        activeRequests: r,
        ratio,
      },
      matchMetrics: {
        avgShortlist,
        confirmedVsMatching,
        acceptanceRate,
        completionRate,
        avgRating,
      },
    };
  }, [jobs, workers, applications]);

  const loading = jobsLoading || workersLoading || appsLoading;
  const error = jobsError || workersError || appsError;
  const hasJobs = jobs.length > 0;

  return (
    <div>
      <PageHeader
        title="Labor Market Analytics"
        subtitle="Live demand signals from Firestore jobs and worker profiles. Descriptive only — not ML forecasting."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered Workers" value={analytics.ratios.workers} />
        <StatCard
          label="Active Service Requests"
          value={analytics.ratios.activeRequests}
        />
        <StatCard
          label="Worker-to-Request Ratio"
          value={analytics.ratios.ratio}
        />
        <StatCard
          label="Skill Watch Items"
          value={analytics.shortages.length}
          helperText={hasJobs ? 'Demand vs local supply' : 'No requests yet'}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Avg Shortlist Size"
          value={analytics.matchMetrics.avgShortlist}
          helperText="Engine matches per job"
        />
        <StatCard
          label="Confirmed vs Matching"
          value={analytics.matchMetrics.confirmedVsMatching}
          helperText="Pipeline snapshot"
        />
        <StatCard
          label="Completion Rate"
          value={analytics.matchMetrics.completionRate}
          helperText="Jobs marked completed"
        />
        <StatCard
          label="Avg Worker Rating"
          value={analytics.matchMetrics.avgRating}
          helperText="From worker profiles"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="panel-surface rounded-xl bg-white/95 p-4">
          <h2 className="text-base font-semibold text-[#1F4E79]">
            Top 5 Most Demanded Skills
          </h2>
          <div className="mt-4 h-64 w-full min-w-0">
            {analytics.topSkills.length === 0 ? (
              <ChartEmpty message="No requests yet — graphs appear when jobs exist." />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={analytics.topSkills}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="skill"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="demand" fill="#2E75B6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="panel-surface rounded-xl bg-white/95 p-4">
          <h2 className="text-base font-semibold text-[#1F4E79]">
            Recent Request Trend
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Jobs grouped by post week (historical count — not a forecast).
          </p>
          <div className="mt-4 h-64 w-full min-w-0">
            {analytics.requestTrend.length === 0 ? (
              <ChartEmpty message="No requests yet — trend line appears when jobs are posted." />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={analytics.requestTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="#1F4E79"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel-surface rounded-xl bg-white/95 p-4">
          <h2 className="text-base font-semibold text-[#1F4E79]">
            Skill Shortage Indicators
          </h2>
          <div className="mt-3 space-y-2">
            {analytics.shortages.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-700">No data available</p>
                <p className="text-xs text-gray-500">
                  Shortage indicators appear when job skill demand exceeds local
                  worker skill supply.
                </p>
              </div>
            ) : (
              analytics.shortages.map((item) => (
                <div
                  key={item.skill}
                  className="rounded-lg border border-red-100 bg-red-50 p-3"
                >
                  <p className="text-sm font-semibold text-red-800">
                    {item.skill} — {item.level}
                  </p>
                  <p className="text-xs text-red-700">
                    Demand {item.demand} · Supply {item.supply} · {item.region}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel-surface rounded-xl bg-white/95 p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-[#1F4E79]">
              Regional Demand Heatmap
            </h2>
            <span className="text-[11px] text-gray-500">
              Olongapo City · density only
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Aggregate demand and supply density. No individual worker or job
            locations are shown.
          </p>

          <div className="mt-3">
            <OlongapoMap height={280}>
              <DemandHeatmap
                points={jobPoints}
                gradient={{
                  0.2: '#bfdbfe',
                  0.5: '#60a5fa',
                  0.8: '#1d4ed8',
                  1.0: '#1e3a8a',
                }}
              />
              <DemandHeatmap
                points={workerPoints}
                radius={28}
                gradient={{
                  0.2: '#fde68a',
                  0.5: '#f59e0b',
                  0.8: '#d97706',
                  1.0: '#b45309',
                }}
              />
            </OlongapoMap>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: '#1d4ed8' }}
              />
              Job density (demand)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: '#d97706' }}
              />
              Worker density (supply)
            </span>
          </div>

          {error ? (
            <p className="mt-2 text-xs text-red-600">
              Could not load data: {error.message || String(error)}
            </p>
          ) : null}
          {loading ? (
            <p className="mt-2 text-xs text-gray-500">Loading from Firestore…</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
