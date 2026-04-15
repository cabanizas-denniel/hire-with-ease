import { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { Link, NavLink } from 'react-router-dom';
import BrandMark from '../../components/BrandMark.jsx';
import heroVector from '../../assets/images/hero-vector-hire-with-ease.png';
import { useAuth } from '../../context/AuthContext.jsx';

const landingNavLinks = [
  { label: 'Home', to: '/' },
  { label: 'Platform', hash: '#landing-features' },
  { label: 'How it Works', hash: '#landing-how' },
  { label: 'FAQs', hash: '#landing-faqs' },
];

const features = [
  {
    k: '01',
    title: 'Push-based matching',
    description: 'Workers don\'t scroll job boards. The system evaluates skills, availability, and location — then pushes relevant jobs directly to qualified workers.',
  },
  {
    k: '02',
    title: 'Availability-first',
    description: 'Time slots drive matching. If a worker isn\'t free when the job needs doing, there\'s no match — regardless of skill fit.',
  },
  {
    k: '03',
    title: 'Structured profiles',
    description: 'Skills, certifications, and experience are captured as structured data — not free-text résumés — so the matching engine can reason about them.',
  },
  {
    k: '04',
    title: 'Trust signals',
    description: 'Verification status, completion rates, and client ratings are visible so both sides can make informed decisions about real-world, in-person work.',
  },
  {
    k: '05',
    title: 'Auto-notification',
    description: 'Workers receive actionable match alerts they accept or decline. Clients see ranked results as workers respond. No manual searching on either side.',
  },
  {
    k: '06',
    title: 'Labor-market view',
    description: 'An admin dashboard surfaces demand signals, skill shortages, and workforce trends — the kind of data a local employment office would use for planning.',
  },
];

const howItWorks = [
  {
    step: '1',
    title: 'Workers set up a service profile',
    description: 'Skills, certifications, location, and — critically — an availability schedule. This is what the system matches against.',
  },
  {
    step: '2',
    title: 'Clients describe what they need',
    description: 'A structured service request: job type, required skills, budget, schedule, and location. No vague postings.',
  },
  {
    step: '3',
    title: 'The system matches automatically',
    description: 'Skill fit, schedule overlap, proximity, and worker reliability are evaluated. Qualified workers get notified instantly.',
  },
  {
    step: '4',
    title: 'Workers accept — not apply',
    description: 'Workers see only jobs they\'re matched to. They accept or decline. No browsing, no keyword guessing, no wasted applications.',
  },
  {
    step: '5',
    title: 'Clients review ranked matches',
    description: 'As workers respond, clients see a ranked list: skills overlap, ratings, completion history. Select the best fit.',
  },
  {
    step: '6',
    title: 'Job completes, feedback loops',
    description: 'Ratings, completion data, and reliability scores feed back into the matching engine — so future matches improve over time.',
  },
];

const faqs = [
  {
    q: 'What is Hire With Ease?',
    a: 'A project-based service marketplace that connects homeowners and clients with skilled informal workers — plumbers, electricians, carpenters, and more — using predictive matching instead of manual search.',
  },
  {
    q: 'How is this different from a job board?',
    a: 'Job boards rely on workers scrolling and applying. Here, the system pushes matched jobs to workers based on skills and availability. Workers accept — they don\'t apply. Think Grab for skilled services, not LinkedIn.',
  },
  {
    q: 'What role does availability play?',
    a: 'Availability is first-class. A plumber who\'s free Tuesday morning gets matched to Tuesday jobs. Skills alone aren\'t enough — timing has to align.',
  },
  {
    q: 'Who is the admin / LGU-PESO role?',
    a: 'A dashboard for local employment officers to monitor demand signals, skill shortages, and workforce availability trends — data that supports evidence-based workforce planning.',
  },
  {
    q: 'Can I try it without a real account?',
    a: 'Yes. Sign up with any email and password, choose your role — Worker, Client, or Admin — and start exploring right away.',
  },
  {
    q: 'Does my data leave this browser?',
    a: 'Your data stays in your browser. Nothing is sent to external servers.',
  },
];

function navLabelUpper(label) {
  return label.toUpperCase();
}

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

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

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
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-gray-300 text-[#1F4E79] lg:hidden"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <AiOutlineClose className="text-xl" aria-hidden /> : <span className="text-lg leading-none">☰</span>}
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
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="landing-menu-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#0f172a]/45 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="pointer-events-auto flex max-h-[min(85dvh,28rem)] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-4">
                <p id="landing-menu-title" className="text-lg font-semibold text-[#1F4E79]">
                  Menu
                </p>
                <button
                  type="button"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                >
                  <AiOutlineClose className="text-2xl" />
                </button>
              </div>
              <nav className="flex min-h-0 flex-col gap-1 overflow-y-auto px-3 py-4">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Explore</p>
                {links.map((item) =>
                  item.hash ? (
                    <a
                      key={item.label}
                      href={item.hash}
                      className="rounded-xl px-3 py-3 text-base font-medium text-[#1F4E79] transition hover:bg-[#1F4E79]/8"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="rounded-xl px-3 py-3 text-base font-medium text-[#1F4E79] transition hover:bg-[#1F4E79]/8"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )
                )}
                <div className="my-3 border-t border-gray-100" />
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Account</p>
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/register"
                      state={{ defaultRole: 'applicant' }}
                      className="rounded-xl px-3 py-3 text-base font-semibold text-[#1F4E79] transition hover:bg-[#1F4E79]/8"
                      onClick={() => setOpen(false)}
                    >
                      Sign up
                    </Link>
                    <Link
                      to="/login"
                      className="rounded-xl border border-[#1F4E79]/25 bg-[#1F4E79]/5 px-3 py-3 text-center text-base font-semibold text-[#1F4E79] transition hover:bg-[#1F4E79]/10"
                      onClick={() => setOpen(false)}
                    >
                      Sign in
                    </Link>
                  </>
                ) : (
                  <Link
                    to={getDefaultRoute()}
                    className="rounded-xl border border-[#1F4E79]/25 bg-[#1F4E79]/5 px-3 py-3 text-center text-base font-semibold text-[#1F4E79] transition hover:bg-[#1F4E79]/10"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LandingSplitHeader links={landingNavLinks} />

      <section className="relative flex min-h-0 flex-col lg:grid lg:min-h-screen lg:grid-cols-2">
        <div className="relative flex min-h-[280px] flex-col justify-center overflow-hidden bg-[#2E75B6] lg:min-h-0 lg:pt-24">
          <WaveEdge />
          <div className="landing-illustration-float relative z-0 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:min-h-0 lg:px-4 lg:py-12 xl:px-6">
            <img
              src={heroVector}
              alt="Skilled worker and client connected through the platform"
              className="h-auto w-full max-w-xl object-contain drop-shadow-lg max-h-[min(54vh,400px)] sm:max-h-[min(60vh,480px)] lg:max-h-[min(86vh,680px)] lg:max-w-2xl xl:max-w-[720px]"
              decoding="async"
              loading="eager"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center bg-white px-4 pb-12 pt-6 sm:px-8 lg:px-10 lg:pb-20 lg:pl-8 lg:pr-12 lg:pt-28 xl:pr-16">
          <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-gray-800 sm:text-4xl lg:text-[2.35rem] xl:text-[2.55rem]">
            Book skilled workers like you book a ride
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-gray-600 sm:text-base">
            Need a plumber, electrician, or carpenter? Describe the job — the system finds available, qualified workers
            and pushes them to you. No browsing. No guessing. Just matched results.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/register"
              state={{ defaultRole: 'employer' }}
              className="inline-flex items-center justify-center rounded-lg bg-[#1F4E79] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#163a5f]"
            >
              I need work done
            </Link>
            <Link
              to="/register"
              state={{ defaultRole: 'applicant' }}
              className="inline-flex items-center justify-center rounded-lg border-2 border-[#1F4E79] bg-white px-6 py-3 text-sm font-semibold text-[#1F4E79] transition hover:bg-[#1F4E79]/5"
            >
              I'm a skilled worker
            </Link>
          </div>

          <div className="mt-8 grid max-w-md grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#1F4E79]">&lt; 4m</p>
              <p className="mt-1 text-xs text-gray-500">Avg match time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F4E79]">94%</p>
              <p className="mt-1 text-xs text-gray-500">Completion rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F4E79]">4.6</p>
              <p className="mt-1 text-xs text-gray-500">Avg worker rating</p>
            </div>
          </div>
        </div>
      </section>

      <section id="landing-features" className="scroll-mt-24 border-t border-gray-200 bg-[#f6f8fb] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E75B6]">Platform</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1F4E79] sm:text-4xl">Not a job board. A matching engine.</h2>
            <p className="mt-4 text-sm text-gray-600 sm:text-base">
              If users are browsing endlessly or searching manually, the core idea has failed. This platform pushes —
              it doesn't wait.
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

      <section id="landing-how" className="scroll-mt-24 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E75B6]">Flow</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1F4E79] sm:text-4xl">How it works end to end</h2>
            <p className="mt-4 text-sm text-gray-600 sm:text-base">
              Two sides — workers and clients — connected by automated matching. No manual searching on either side.
            </p>
          </div>
          <div className="relative mx-auto mt-12 max-w-4xl lg:max-w-5xl">
            <div
              className="absolute left-[1.125rem] top-3 bottom-3 w-px bg-gradient-to-b from-[#2E75B6] via-[#1F4E79]/35 to-transparent sm:left-[1.25rem]"
              aria-hidden
            />
            <ul className="relative space-y-5 sm:space-y-6">
              {howItWorks.map((item) => (
                <li key={item.step} className="relative pl-10 sm:pl-12">
                  <div className="absolute left-0 top-5 flex h-9 w-9 items-center justify-center rounded-xl border-[3px] border-white bg-[#1F4E79] text-xs font-bold text-white shadow-sm sm:top-6 sm:h-10 sm:w-10 sm:text-sm">
                    {item.step}
                  </div>
                  <div className="rounded-2xl border border-gray-200/90 bg-[#f6f8fb] p-5 shadow-sm sm:p-6 lg:p-7">
                    <h3 className="text-lg font-semibold text-[#1F4E79]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-[0.9375rem]">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="landing-faqs" className="scroll-mt-24 border-t border-gray-200 bg-[#f6f8fb] py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E75B6]">Help</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1F4E79] sm:text-4xl">Questions &amp; Answers</h2>
            <p className="mt-4 text-sm text-gray-600">Clear answers about what this platform does and doesn't do.</p>
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
            <p className="text-xl font-semibold text-white sm:text-2xl">Get started in under a minute</p>
            <p className="mt-2 text-sm text-white/80">Create an account, pick your role, and explore the full platform.</p>
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
                On-demand skilled worker matching — connecting clients with qualified workers through predictive analytics for informal labor markets.
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-[#1F4E79]">Contact</p>
              <p className="mt-1">support@hirewithease.ph</p>
              <p>+63 900 000 0000</p>
            </div>
          </div>
          <p className="mt-8 border-t border-gray-200/80 pt-8 text-center text-xs text-gray-500 sm:text-left">
            &copy; {new Date().getFullYear()} Hire With Ease. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
