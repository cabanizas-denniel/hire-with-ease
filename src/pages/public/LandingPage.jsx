import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import BrandMark from '../../components/BrandMark.jsx';
import heroVector from '../../assets/images/hero-vector-hire-with-ease.png';
import { useAuth } from '../../context/AuthContext.jsx';
import jobs from '../../data/jobs.js';

const landingNavLinks = [
  { label: 'Home', to: '/' },
  { label: 'Platform', hash: '#landing-features' },
  { label: 'How it Works', hash: '#landing-how' },
  { label: 'FAQs', hash: '#landing-faqs' },
];

const features = [
  {
    k: '01',
    title: 'Match by trade',
    description: 'Skill taxonomy—from plumbing to electrical—powers recommendations instead of generic job titles.',
  },
  {
    k: '02',
    title: 'Trust the profile',
    description: 'Experience, certifications, and availability are structured so employers can shortlist with confidence.',
  },
  {
    k: '03',
    title: 'See the market',
    description: 'LGU-PESO style analytics surface demand and shortages for policy-minded reviewers (thesis demo).',
  },
];

const howItWorks = [
  {
    step: '1',
    title: 'Choose your role',
    description: 'Applicants and employers set up profiles tuned to how they use the platform.',
  },
  {
    step: '2',
    title: 'Post or browse',
    description: 'Jobs go up with required trades; workers see listings aligned to skills and area.',
  },
  {
    step: '3',
    title: 'Apply & hire',
    description: 'Track applications, matches, and outcomes from a single dashboard—no backend required for the demo.',
  },
];

const faqs = [
  {
    q: 'What is Hire With Ease?',
    a: 'A thesis prototype: skilled-work matching with mock data, role dashboards, and labor-market style charts for Admins.',
  },
  {
    q: 'Can I log in without signing up for real?',
    a: 'Yes. Use any email and password, pick Applicant, Employer, or Admin—the session is mock only.',
  },
  {
    q: 'Will my data leave this browser?',
    a: 'Not in this build. Everything is local mock state unless you later add APIs (see TODO comments in code).',
  },
];

function navLabelUpper(label) {
  return label.toUpperCase();
}

/** White wave between blue (left) and white (right) hero columns */
function WaveEdge() {
  return (
    <svg
      className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-[min(13vw,6.5rem)] min-w-[3.25rem] translate-x-[calc(100%-1px)] lg:block"
      viewBox="0 0 100 400"
      preserveAspectRatio="none"
      aria-hidden
    >
      <g transform="scale(-1, 1) translate(-100, 0)">
        <path
          fill="#ffffff"
          d="M100,0 L100,400 L18,400 Q-2,340 22,280 Q48,220 18,160 Q-4,100 24,52 Q48,8 12,0 Z"
        />
      </g>
    </svg>
  );
}

function LandingSplitHeader({ links }) {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, getDefaultRoute } = useAuth();

  /* Nav sits on white (right column on desktop); logo on blue (left) */
  const navLinkClass =
    'text-xs font-semibold tracking-[0.14em] text-[#1F4E79] hover:text-[#2E75B6] lg:text-[#1F4E79] lg:hover:text-[#2E75B6]';
  const btnOutline =
    'rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-wide border-[#1F4E79] text-[#1F4E79] hover:bg-[#1F4E79]/8 lg:border-[#1F4E79] lg:text-[#1F4E79] lg:hover:bg-[#1F4E79]/10';

  return (
    <header className="relative z-30 border-b border-gray-200 bg-white lg:absolute lg:inset-x-0 lg:top-0 lg:grid lg:grid-cols-[1.14fr_0.86fr] lg:border-0 lg:bg-transparent">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-10 xl:pl-16">
        <BrandMark to="/" variant="landingSplit" />
        <button
          type="button"
          className="rounded-md border border-gray-300 p-2 text-[#1F4E79] lg:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>
      </div>

      <div className="hidden items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:flex lg:px-10 lg:pr-12 xl:pr-16">
        <nav className="flex flex-wrap items-center justify-center gap-5 xl:gap-7">
          {links.map((item) =>
            item.hash ? (
              <a key={item.label} href={item.hash} className={navLinkClass}>
                {navLabelUpper(item.label)}
              </a>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `${navLinkClass} ${isActive ? 'underline underline-offset-4' : ''}`}
              >
                {navLabelUpper(item.label)}
              </NavLink>
            )
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <Link to={getDefaultRoute()} className={`${btnOutline} inline-flex bg-[#1F4E79]/5`}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" state={{ defaultRole: 'applicant' }} className={btnOutline}>
                Sign up
              </Link>
              <Link to="/login" className={btnOutline}>
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>

      {open ? (
        <div className="border-t border-gray-100 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-2 text-sm font-medium text-[#1F4E79]">
            {links.map((item) =>
              item.hash ? (
                <a key={item.label} href={item.hash} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} to={item.to} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              )
            )}
            {!isAuthenticated ? (
              <>
                <Link to="/register" state={{ defaultRole: 'applicant' }} onClick={() => setOpen(false)}>
                  Sign up
                </Link>
                <Link to="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </>
            ) : (
              <Link to={getDefaultRoute()} onClick={() => setOpen(false)}>
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function LandingPage() {
  const jobCount = jobs.length;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LandingSplitHeader links={landingNavLinks} />

      {/* Split hero — blue + art (left), white + copy (right), wavy seam */}
      <section className="relative flex min-h-0 flex-col lg:grid lg:min-h-screen lg:grid-cols-2">
        <div className="relative flex min-h-[280px] flex-col justify-center overflow-hidden bg-[#2E75B6] lg:min-h-0 lg:pt-24">
          <WaveEdge />
          <div className="landing-illustration-float relative z-0 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:min-h-0 lg:px-4 lg:py-12 xl:px-6">
            <img
              src={heroVector}
              alt="Technician and client planning work together"
              className="h-auto w-full max-w-xl object-contain drop-shadow-lg max-h-[min(54vh,400px)] sm:max-h-[min(60vh,480px)] lg:max-h-[min(86vh,680px)] lg:max-w-2xl xl:max-w-[720px]"
              decoding="async"
              loading="eager"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center bg-white px-4 pb-12 pt-6 sm:px-8 lg:px-10 lg:pb-20 lg:pl-8 lg:pr-12 lg:pt-28 xl:pr-16">
          <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-gray-800 sm:text-4xl lg:text-[2.35rem] xl:text-[2.55rem]">
            Your link to skilled work opportunities
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-gray-600 sm:text-base">
            Trades, repairs, and installs—matched with clarity. Built as a thesis demo for workers, employers, and LGU-PESO
            insights.
          </p>

          <div className="mt-8 max-w-xl">
            <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
              <span className="flex items-center pl-4 text-gray-400" aria-hidden>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <input
                type="search"
                readOnly
                placeholder="Search skills, trade, or location"
                className="min-w-0 flex-1 border-0 bg-transparent py-3.5 pl-2 pr-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                aria-label="Search — opens applicant registration"
              />
              <Link
                to="/register"
                state={{ defaultRole: 'applicant' }}
                className="flex aspect-square w-14 shrink-0 items-center justify-center bg-[#2E75B6] text-white transition hover:bg-[#256cad]"
                aria-label="Search with profile"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              We offer{' '}
              <span className="font-semibold text-[#2E75B6]">
                {jobCount}+ sample job postings
              </span>{' '}
              in the demo—sign in to explore full dashboards.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/register"
              state={{ defaultRole: 'applicant' }}
              className="inline-flex items-center justify-center rounded-lg bg-[#1F4E79] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#163a5f]"
            >
              Find work
            </Link>
            <Link
              to="/register"
              state={{ defaultRole: 'employer' }}
              className="inline-flex items-center justify-center rounded-lg border-2 border-[#1F4E79] bg-white px-6 py-3 text-sm font-semibold text-[#1F4E79] transition hover:bg-[#1F4E79]/5"
            >
              Hire now
            </Link>
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="landing-features" className="scroll-mt-24 border-t border-gray-200 bg-[#f6f8fb] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E75B6]">Platform</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1F4E79] sm:text-4xl">Why this project exists</h2>
            <p className="mt-4 text-sm text-gray-600 sm:text-base">
              Three focused ideas—matching, trust, and insight—for a defensible thesis story.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {features.map((feature) => (
              <article
                key={feature.k}
                className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-[#2E75B6]/35 hover:shadow-md"
              >
                <span className="font-mono text-3xl font-bold tabular-nums text-[#2E75B6]/40 transition group-hover:text-[#2E75B6]/70">
                  {feature.k}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-[#1F4E79]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="landing-how" className="scroll-mt-24 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E75B6]">Flow</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1F4E79] sm:text-4xl">How it works</h2>
            <p className="mt-4 text-sm text-gray-600 sm:text-base">
              One product, two sides—workers and hirers meet in the middle.
            </p>
          </div>
          <ul className="mx-auto mt-12 max-w-xl space-y-5">
            {howItWorks.map((item) => (
              <li
                key={item.step}
                className="flex gap-4 rounded-2xl border border-gray-200/90 bg-[#f6f8fb] p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1F4E79] text-sm font-bold text-white">
                  {item.step}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#1F4E79]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQs */}
      <section id="landing-faqs" className="scroll-mt-24 border-t border-gray-200 bg-[#f6f8fb] py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E75B6]">Help</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1F4E79] sm:text-4xl">FAQs</h2>
            <p className="mt-4 text-sm text-gray-600">Straight answers for demo day.</p>
          </div>
          <div className="mt-10 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
            {faqs.map((item) => (
              <details key={item.q} className="group px-5 py-4 first:rounded-t-2xl last:rounded-b-2xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-left font-semibold text-[#1F4E79]">
                  <span>{item.q}</span>
                  <span className="mt-0.5 inline-block text-[#2E75B6] transition group-open:rotate-180">⌄</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1F4E79] py-12 sm:py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
          <div className="max-w-xl">
            <p className="text-xl font-semibold text-white sm:text-2xl">Try the demo in under a minute</p>
            <p className="mt-2 text-sm text-white/80">Mock login, pick a role, click through real screens—no API keys.</p>
          </div>
          <Link
            to="/login"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-[#1F4E79] shadow-lg transition hover:bg-gray-100"
          >
            Open login
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-[#f0f3f7]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-bold text-[#1F4E79]">Hire With Ease</p>
              <p className="mt-2 max-w-sm text-sm text-gray-600">
                Predictive matching and labor insights for skilled work—a college thesis front-end.
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-[#1F4E79]">Contact</p>
              <p className="mt-1">lgu-peso@example.org</p>
              <p>+63 900 000 0000</p>
            </div>
          </div>
          <p className="mt-8 border-t border-gray-200/80 pt-8 text-center text-xs text-gray-500 sm:text-left">
            Placeholder contact · prototype only
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
