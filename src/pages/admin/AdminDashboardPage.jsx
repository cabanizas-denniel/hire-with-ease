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

function AdminDashboardPage() {
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
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer>
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
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer>
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
            {analytics.shortages.map((item) => (
              <div key={item.skill} className="rounded-lg border border-red-100 bg-red-50 p-3">
                <p className="text-sm font-semibold text-red-800">{item.skill} - {item.level}</p>
                <p className="text-xs text-red-700">Region: {item.region}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-[#1F4E79]">Regional Demand Heatmap</h2>
          <div className="mt-3 flex h-48 items-center justify-center rounded-lg bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500 text-sm font-medium text-[#1F4E79]">
            Regional Demand Overview
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
