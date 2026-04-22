const analytics = {
  topSkills: [
    { skill: 'Electrical', demand: 58 },
    { skill: 'Plumbing', demand: 47 },
    { skill: 'Roofing', demand: 42 },
    { skill: 'Painting', demand: 38 },
    { skill: 'HVAC', demand: 34 },
  ],
  requestTrend: [
    { month: 'Nov', requests: 31 },
    { month: 'Dec', requests: 38 },
    { month: 'Jan', requests: 44 },
    { month: 'Feb', requests: 52 },
    { month: 'Mar', requests: 58 },
    { month: 'Apr', requests: 67 },
  ],
  ratios: {
    workers: 40,
    activeRequests: 23,
    ratio: '1.74 : 1',
  },
  matchMetrics: {
    avgMatchTime: '< 5 min',
    acceptanceRate: '82%',
    completionRate: '91%',
    avgRating: '4.5',
  },
  shortages: [
    { skill: 'HVAC', level: 'High shortage', region: 'Olongapo Central' },
    { skill: 'Solar Panel Installation', level: 'Moderate shortage', region: 'Subic Bay Area' },
    { skill: 'Welding', level: 'High shortage', region: 'Olongapo East' },
    { skill: 'Heavy Equipment Operation', level: 'High shortage', region: 'Olongapo North' },
  ],
};

export default analytics;
