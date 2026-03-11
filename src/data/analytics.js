const analytics = {
  topSkills: [
    { skill: 'Electrical', demand: 48 },
    { skill: 'Plumbing', demand: 43 },
    { skill: 'Masonry', demand: 39 },
    { skill: 'HVAC', demand: 34 },
    { skill: 'Welding', demand: 31 },
  ],
  postingTrend: [
    { month: 'Jan', jobs: 48 },
    { month: 'Feb', jobs: 55 },
    { month: 'Mar', jobs: 52 },
    { month: 'Apr', jobs: 60 },
    { month: 'May', jobs: 66 },
    { month: 'Jun', jobs: 64 },
  ],
  ratios: {
    applicants: 128,
    openJobs: 92,
    ratio: '1.39 : 1',
  },
  shortages: [
    { skill: 'HVAC', level: 'High shortage', region: 'NCR North' },
    { skill: 'Solar Panel Installation', level: 'Moderate shortage', region: 'NCR East' },
    { skill: 'Welding', level: 'High shortage', region: 'NCR South' },
  ],
};

export default analytics;
