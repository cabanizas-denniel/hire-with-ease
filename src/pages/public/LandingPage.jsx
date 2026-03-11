import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';

const features = [
  {
    title: 'Smart Matching',
    description: 'Predictive analytics helps connect workers to the right opportunities faster.',
  },
  {
    title: 'Verified Workers',
    description: 'Employers can shortlist applicants with documented experience and certifications.',
  },
  {
    title: 'Safe Payments',
    description: 'Structured project terms help reduce disputes and improve work completion rates.',
  },
];

const howItWorks = [
  {
    title: '1. Create Role-Based Account',
    description: 'Applicants and employers register with role-specific profile details.',
  },
  {
    title: '2. Post or Discover Opportunities',
    description: 'Employers post job requests, while applicants receive recommended listings.',
  },
  {
    title: '3. Match, Hire, and Track Outcomes',
    description: 'Dashboards track applications, hires, and labor demand trends in one place.',
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar links={[{ to: '/', label: 'Home' }, { to: '/login', label: 'Login' }, { to: '/register', label: 'Register' }]} />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#2E75B6]">Predictive Recruitment Platform</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-[#1F4E79] sm:text-4xl">
              Better Hiring Decisions for Skilled Work Opportunities
            </h1>
            <p className="mt-4 text-sm text-gray-600 sm:text-base">
              Hire With Ease supports applicants, employers, and LGU-PESO officers with smart job matching and labor market insights.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="rounded-lg bg-[#1F4E79] px-5 py-3 text-center text-sm font-semibold text-white">
                Find Work
              </Link>
              <Link to="/register" className="rounded-lg border border-[#1F4E79] px-5 py-3 text-center text-sm font-semibold text-[#1F4E79]">
                Hire Now
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-6 shadow-sm">
            <p className="text-sm font-semibold text-[#1F4E79]">Thesis Demo Snapshot</p>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>- Multi-role dashboards for Applicant, Employer, and Admin.</li>
              <li>- Skill-based matching from predefined worker taxonomy.</li>
              <li>- Analytics visualizations for labor demand trends.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold text-[#1F4E79]">Feature Highlights</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl bg-white p-4 shadow-sm">
                <h3 className="text-base font-semibold text-[#1F4E79]">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold text-[#1F4E79]">How It Works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {howItWorks.map((step) => (
              <div key={step.title} className="rounded-xl border border-gray-200 p-4">
                <h3 className="text-base font-semibold text-[#1F4E79]">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-600 sm:px-6">
          <p>Hire With Ease - Contact: lgu-peso@example.org | +63 900 000 0000</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
