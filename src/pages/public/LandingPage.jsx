import { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { Link, NavLink } from 'react-router-dom';
import BrandMark from '../../components/BrandMark.jsx';
import Reveal from '../../components/Reveal.jsx';
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
    description:
      "Workers don't scroll job boards. The system evaluates skills, location, and reputation — then pushes relevant jobs directly to qualified workers.",
  },
  {
    k: '02',
    title: 'Agree the schedule in chat',
    description:
      "After a match, both sides lock a final start date & time, agreed price, and what is / isn't included — no calendar slots to maintain up front.",
  },
  {
    k: '03',
    title: 'Structured profiles',
    description:
      'Skills, certifications, and experience are captured as structured data — not free-text résumés — so the matching engine can reason about them.',
  },
  {
    k: '04',
    title: 'Trust signals',
    description:
      'Verification status, completion rates, and client ratings are visible so both sides can make informed decisions about real-world, in-person work.',
  },
  {
    k: '05',
    title: 'Auto-notification',
    description:
      'Workers receive actionable match alerts they accept or decline. Clients see ranked results as workers respond. No manual searching on either side.',
  },
  {
    k: '06',
    title: 'Labor-market view',
    description:
      'An admin dashboard surfaces demand signals, skill shortages, and workforce trends — the kind of data a local employment office would use for planning.',
  },
];

const howItWorks = [
  {
    step: '1',
    title: 'Workers set up a service profile',
    description: 'Skills, certifications, and home location. This is what the system matches against.',
  },
  {
    step: '2',
    title: 'Clients describe what they need',
    description:
      'A structured service request: category, title, budget, preferred start, location, and photos or video of the issue. No vague postings.',
  },
  {
    step: '3',
    title: 'The system matches automatically',
    description:
      'Skill fit, proximity, category preference, and worker reliability are evaluated. Qualified workers get notified instantly.',
  },
  {
    step: '4',
    title: 'Workers accept — not apply',
    description:
      "Workers see only jobs they're matched to. They accept or decline. No browsing, no keyword guessing, no wasted applications.",
  },
  {
    step: '5',
    title: 'Clients review ranked matches',
    description:
      'As workers respond, clients see a ranked list: skills overlap, ratings, completion history. Select the best fit.',
  },
  {
    step: '6',
    title: 'Job completes, feedback loops',
    description:
      'Ratings, completion data, and reliability scores feed back into the matching engine — so future matches improve over time.',
  },
];

const tickerPhrases = [
  'Plumbers',
  'Electricians',
  'Carpenters',
  'Verified workers',
  'Matched in minutes',
  'Pushed to you, not searched for',
  'Describe the job once',
];

const faqs = [
  {
    q: 'What is Hire With Ease?',
    a: 'A project-based service marketplace that connects homeowners and clients with skilled informal workers — plumbers, electricians, carpenters, and more — using ranked matching (scored shortlists) instead of manual search.',
  },
  {
    q: 'How is this different from a job board?',
    a: "Job boards rely on workers scrolling and applying. Here, the system pushes matched jobs to workers based on skills and location. Workers accept — they don't apply. Think Grab for skilled services, not LinkedIn.",
  },
  {
    q: 'How do start times get set?',
    a: 'In chat, either side opens Schedule and proposes a final start date & time, agreed price, and scope (included / not included). Both sides confirm to lock the hire.',
  },
  {
    q: 'Who is the admin / LGU-PESO role?',
    a: 'A dashboard for local employment officers to monitor demand signals, skill shortages, and workforce trends — data that supports evidence-based workforce planning.',
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

function LandingPublicHeader({ links }) {
  const { isAuthenticated, getDefaultRoute } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const navLinkClass =
    'text-xs font-semibold tracking-[0.14em] text-[var(--hwe-slate)] hover:opacity-80';

  return (
    <header className="relative z-30 bg-[var(--hwe-strong)]">
      <div className="flex min-w-0 items-center justify-between gap-3 px-[var(--hwe-page-pad)] py-4">
        <BrandMark to="/" variant="onStrong" />
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
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
                  `${navLinkClass} ${isActive ? 'font-bold' : ''}`
                }
              >
                {navLabelUpper(item.label)}
              </NavLink>
            ),
          )}
        </nav>
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link to={getDefaultRoute()} className="btn-primary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" state={{ defaultRole: 'applicant' }} className="btn-secondary">
                Sign up
              </Link>
              <Link to="/login" className="btn-primary">
                Sign in
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--hwe-slate)]/25 text-[var(--hwe-slate)] md:hidden"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <AiOutlineClose className="text-xl" aria-hidden /> : <span className="text-lg leading-none">☰</span>}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--hwe-slate)]/15 bg-[var(--hwe-strong)] px-[var(--hwe-page-pad)] py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((item) =>
              item.hash ? (
                <a
                  key={item.label}
                  href={item.hash}
                  className="rounded-xl px-3 py-3 text-base font-semibold text-[var(--hwe-slate)]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-xl px-3 py-3 text-base font-semibold text-[var(--hwe-slate)]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className="my-2 border-t border-[var(--hwe-slate)]/15" />
            {isAuthenticated ? (
              <Link to={getDefaultRoute()} className="btn-primary w-full" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  state={{ defaultRole: 'applicant' }}
                  className="btn-secondary w-full"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
                <Link to="/login" className="btn-primary w-full" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--hwe-canvas)] text-[var(--hwe-slate)]">
      <LandingPublicHeader links={landingNavLinks} />

      {/* Full-width blue hero */}
      <section className="relative overflow-hidden bg-[var(--hwe-strong)]">
        <div className="relative grid w-full min-w-0 grid-cols-1 items-center gap-8 px-[var(--hwe-page-pad)] py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 lg:pb-16 lg:pt-16 xl:pb-20 xl:pt-20">
          <div className="reveal-hero relative z-10 min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--hwe-slate-mid)]">
              Hire With Ease
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[var(--hwe-slate)] sm:text-4xl lg:text-5xl">
              Connect with skilled workers—simple,{' '}
              <span className="highlight-mark">fast</span>, and effortless
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--hwe-slate-mid)] sm:text-lg">
              Need a plumber, electrician, or carpenter? Describe the job — the system finds available,
              qualified workers and pushes them to you.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/register" state={{ defaultRole: 'employer' }} className="btn-primary px-6 py-3 text-base">
                I need work done
              </Link>
              <Link
                to="/register"
                state={{ defaultRole: 'applicant' }}
                className="btn-secondary border-[var(--hwe-slate)]/25 bg-white/80 px-6 py-3 text-base"
              >
                I&apos;m a skilled worker
              </Link>
            </div>
          </div>
          <div className="relative z-10 flex min-w-0 items-center justify-center">
            <div className="landing-illustration-float relative w-full">
              <img
                src={heroVector}
                alt="Skilled worker and client connected through the platform"
                className="h-auto w-full max-h-[min(52vh,420px)] object-contain lg:max-h-[min(70vh,560px)]"
                decoding="async"
                loading="eager"
              />
            </div>
          </div>
        </div>

        <div className="hero-ticker" tabIndex={0} aria-label="Service highlights">
          <div className="hero-ticker-track">
            <div className="hero-ticker-set">
              {tickerPhrases.map((phrase) => (
                <span key={phrase} className="hero-ticker-item">
                  {phrase}
                  <span className="hero-ticker-sep" aria-hidden="true" />
                </span>
              ))}
            </div>
            <div className="hero-ticker-set" data-ticker-clone aria-hidden="true">
              {tickerPhrases.map((phrase) => (
                <span key={`clone-${phrase}`} className="hero-ticker-item">
                  {phrase}
                  <span className="hero-ticker-sep" aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Off-white features */}
      <section id="landing-features" className="relative scroll-mt-24 overflow-hidden bg-[var(--hwe-canvas)] py-16 sm:py-20">
        <div className="section-glow-bleed" aria-hidden="true" />
        <div className="section-glow-corner section-glow-corner-tl" aria-hidden="true" />
        <div className="section-glow-corner section-glow-corner-br" aria-hidden="true" />
        <div className="relative z-[1] w-full min-w-0 px-[var(--hwe-page-pad)]">
          <Reveal className="w-full">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--hwe-slate-soft)]">
              Platform
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--hwe-slate)] sm:text-4xl">
              Not a job board. A matching engine.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--hwe-muted)]">
              If users are browsing endlessly or searching manually, the core idea has failed. This
              platform pushes — it doesn&apos;t wait.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {features.map((feature, i) => (
              <Reveal key={feature.k} as="article" className="card-surface min-w-0 p-6" delayMs={i * 100}>
                <span className="font-mono text-2xl font-bold tabular-nums text-[var(--hwe-strong)]">
                  {feature.k}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-[var(--hwe-slate)]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--hwe-muted)]">{feature.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Blue band — split value */}
      <section className="bg-[var(--hwe-strong)] py-14 sm:py-16">
        <div className="grid w-full min-w-0 grid-cols-1 gap-8 px-[var(--hwe-page-pad)] md:grid-cols-2 md:items-center">
          <Reveal className="min-w-0">
            <h2 className="text-2xl font-bold text-[var(--hwe-slate)] sm:text-3xl">
              Two sides. One matching engine.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--hwe-slate-mid)]">
              Workers get jobs pushed to them. Clients get ranked shortlists. No endless scrolling on
              either side.
            </p>
          </Reveal>
          <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { v: '< 4m', l: 'Avg match time' },
              { v: '94%', l: 'Completion rate' },
              { v: '4.6', l: 'Avg worker rating' },
            ].map((s, i) => (
              <Reveal key={s.l} as="li" className="rounded-xl bg-white/70 px-4 py-4 text-center" delayMs={i * 90}>
                <p className="text-2xl font-bold text-[var(--hwe-slate)]">{s.v}</p>
                <p className="mt-1 text-xs text-[var(--hwe-slate-mid)]">{s.l}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works — surface */}
      <section id="landing-how" className="scroll-mt-24 bg-[var(--hwe-surface)] py-16 sm:py-20">
        <div className="w-full min-w-0 px-[var(--hwe-page-pad)]">
          <Reveal className="w-full">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--hwe-slate-soft)]">
              Flow
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--hwe-slate)] sm:text-4xl">
              How it works end to end
            </h2>
            <p className="mt-4 max-w-3xl text-base text-[var(--hwe-muted)]">
              Two sides — workers and clients — connected by automated matching.
            </p>
          </Reveal>
          <ol className="mt-12 grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {howItWorks.map((item, i) => (
              <Reveal key={item.step} as="li" className="card-surface relative min-w-0 p-5 sm:p-6" delayMs={i * 100}>
                <span className="highlight-pill">{item.step}</span>
                <h3 className="mt-3 text-lg font-semibold text-[var(--hwe-slate)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--hwe-muted)]">{item.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ — canvas */}
      <section id="landing-faqs" className="scroll-mt-24 bg-[var(--hwe-canvas-deep)] py-16 sm:py-20">
        <div className="w-full min-w-0 px-[var(--hwe-page-pad)]">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--hwe-slate-soft)]">
              Help
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--hwe-slate)] sm:text-4xl">
              Questions &amp; Answers
            </h2>
          </Reveal>
          <div className="mt-10 divide-y divide-[var(--hwe-border)] rounded-2xl border border-[var(--hwe-border)] bg-[var(--hwe-surface)]">
            {faqs.map((item, i) => (
              <Reveal
                key={item.q}
                as="details"
                className="group px-5 py-4 first:rounded-t-2xl last:rounded-b-2xl [&_summary::-webkit-details-marker]:hidden"
                delayMs={i * 80}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-left font-semibold text-[var(--hwe-slate)]">
                  <span className="min-w-0">{item.q}</span>
                  <span className="mt-0.5 shrink-0 text-[var(--hwe-strong)] transition group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--hwe-muted)]">{item.a}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band — blue */}
      <section className="bg-[var(--hwe-strong)] py-12 sm:py-14">
        <Reveal className="flex w-full min-w-0 flex-col items-start gap-6 px-[var(--hwe-page-pad)] md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-xl font-semibold text-[var(--hwe-slate)] sm:text-2xl">
              Get started in under a minute
            </p>
            <p className="mt-2 text-sm text-[var(--hwe-slate-mid)]">
              Create an account, pick your role, and explore the full platform.
            </p>
          </div>
          <Link to="/login" className="btn-primary shrink-0 px-8 py-3.5">
            Open login
          </Link>
        </Reveal>
      </section>

      <footer className="bg-[var(--hwe-slate)] text-[var(--hwe-on-slate)]">
        <div className="w-full min-w-0 px-[var(--hwe-page-pad)] py-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold">Hire With Ease</p>
              <p className="mt-2 w-full text-sm leading-relaxed text-white/70">
                On-demand skilled worker matching — connecting clients with qualified workers through
                scored shortlists for informal labor markets in Olongapo.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                <Link to="/privacy" className="text-sm font-semibold text-[var(--hwe-strong)] hover:underline">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-sm font-semibold text-[var(--hwe-strong)] hover:underline">
                  Terms & Conditions
                </Link>
              </div>
            </div>
            <div className="shrink-0 text-sm text-white/70">
              <p className="font-semibold text-white">Contact</p>
              <p className="mt-1">support@hirewithease.ph</p>
              <p>+63 900 000 0000</p>
            </div>
          </div>
          <p className="mt-8 border-t border-white/15 pt-8 text-center text-xs text-white/50 sm:text-left">
            &copy; {new Date().getFullYear()} Hire With Ease. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
