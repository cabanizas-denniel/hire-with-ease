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
import analytics from '../../data/analytics.js';
import OlongapoMap from '../../components/maps/OlongapoMap.jsx';
import DemandHeatmap from '../../components/maps/DemandHeatmap.jsx';
import { useJobs, useWorkerProfiles } from '../../lib/useFirestoreData.js';

const OPEN_JOB_STATUSES = new Set(['Matching', 'Matched', 'In Progress']);

function AdminDashboardPage() {
  const { data: jobs, loading: jobsLoading, error: jobsError } = useJobs();
  const { data: workers, loading: workersLoading, error: workersError } = useWorkerProfiles();

  // Aggregate density only — no individual locations or identifying data are
  // surfaced. The heatmap consumes (lat, lng) points server-side and renders
  // a smoothed gradient, so reviewers can see regional demand vs supply
  // without identifying any specific worker or homeowner.
  const jobPoints = useMemo(
    () =>
      jobs
        .filter((j) => OPEN_JOB_STATUSES.has(j.status))
        .filter((j) => j?.location?.lat && j?.location?.lng)
        .map((j) => ({ lat: j.location.lat, lng: j.location.lng, weight: 1 })),
    [jobs]
  );

  const workerPoints = useMemo(
    () =>
      workers
        .filter((w) => (w.moderationStatus || 'active') !== 'banned')
        .filter((w) => w?.location?.lat && w?.location?.lng)
        .map((w) => ({ lat: w.location.lat, lng: w.location.lng, weight: 1 })),
    [workers]
  );

  const loading = jobsLoading || workersLoading;
  const error = jobsError || workersError;

  return (
    <div>
      <PageHeader
        title="Labor Market Analytics"
        subtitle="Monitor demand signals, shortages, matching performance, and workforce availability."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered Workers" value={analytics.ratios.workers} />
        <StatCard label="Active Service Requests" value={analytics.ratios.activeRequests} />
        <StatCard label="Worker-to-Request Ratio" value={analytics.ratios.ratio} />
        <StatCard label="Critical Skill Gaps" value={analytics.shortages.length} helperText="Needs intervention" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Avg Match Time" value={analytics.matchMetrics.avgMatchTime} helperText="System performance" />
        <StatCard label="Acceptance Rate" value={analytics.matchMetrics.acceptanceRate} helperText="Workers accepting matches" />
        <StatCard label="Completion Rate" value={analytics.matchMetrics.completionRate} helperText="Jobs finished" />
        <StatCard label="Avg Worker Rating" value={analytics.matchMetrics.avgRating} helperText="Client feedback" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-[#1F4E79]">Top 5 Most Demanded Skills</h2>
          <div className="mt-4 h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={analytics.topSkills}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="skill" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="demand" fill="#2E75B6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-[#1F4E79]">Service Request Trend</h2>
          <div className="mt-4 h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={analytics.requestTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="#1F4E79" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-[#1F4E79]">Skill Shortage Indicators</h2>
          <div className="mt-3 space-y-2">
            {analytics.shortages.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-700">No data available</p>
                <p className="text-xs text-gray-500">
                  Skill shortage indicators will appear here once analytics data is provided.
                </p>
              </div>
            ) : (
              analytics.shortages.map((item) => (
                <div key={item.skill} className="rounded-lg border border-red-100 bg-red-50 p-3">
                  <p className="text-sm font-semibold text-red-800">
                    {item.skill} - {item.level}
                  </p>
                  <p className="text-xs text-red-700">Region: {item.region}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-[#1F4E79]">Regional Demand Heatmap</h2>
            <span className="text-[11px] text-gray-500">Olongapo City · density only</span>
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
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: '#1d4ed8' }} />
              Job density (demand)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: '#d97706' }} />
              Worker density (supply)
            </span>
          </div>

          {error ? (
            <p className="mt-2 text-xs text-red-600">
              Could not load heatmap data: {error.message || String(error)}
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
