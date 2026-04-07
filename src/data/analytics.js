const analytics = {
  topSkills: [
    { skill: 'Electrical', demand: 48 },
    { skill: 'Plumbing', demand: 43 },
    { skill: 'Masonry', demand: 39 },
    { skill: 'HVAC', demand: 34 },
    { skill: 'Welding', demand: 31 },
  ],
  requestTrend: [
    { month: 'Jan', requests: 48 },
    { month: 'Feb', requests: 55 },
    { month: 'Mar', requests: 52 },
    { month: 'Apr', requests: 60 },
    { month: 'May', requests: 66 },
    { month: 'Jun', requests: 64 },
  ],
  ratios: {
    workers: 128,
    activeRequests: 92,
    ratio: '1.39 : 1',
  },
  matchMetrics: {
    avgMatchTime: '< 4 min',
    acceptanceRate: '78%',
    completionRate: '94%',
    avgRating: '4.6',
  },
  shortages: [
    { skill: 'HVAC', level: 'High shortage', region: 'NCR North' },
    { skill: 'Solar Panel Installation', level: 'Moderate shortage', region: 'NCR East' },
    { skill: 'Welding', level: 'High shortage', region: 'NCR South' },
  ],
};

export default analytics;
