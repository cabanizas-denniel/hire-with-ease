import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import BrandMark from '../BrandMark.jsx';
import heroVector from '../../assets/images/hero-vector-hire-with-ease.png';

/**
 * Two-pane auth shell used by Login & Register.
 */
function AuthLayout({
  title,
  subtitle,
  tagline,
  benefits,
  children,
  footer,
}) {
  return (
    <div className="min-h-dvh min-h-screen bg-[var(--hwe-canvas)]">
      <header className="flex min-w-0 items-center justify-between border-b border-[var(--hwe-slate)]/15 bg-[var(--hwe-strong)] px-[var(--hwe-page-pad)] py-3 lg:hidden">
        <BrandMark to="/" variant="onStrong" />
        <Link
          to="/"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--hwe-slate)] hover:underline"
        >
          <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
          Home
        </Link>
      </header>

      <div className="min-w-0 lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <aside className="relative hidden min-w-0 overflow-hidden bg-[var(--hwe-slate)] text-white lg:flex lg:flex-col">
          <div className="relative z-10 flex min-w-0 items-center justify-between px-[var(--hwe-page-pad)] pt-10">
            <BrandMark to="/" variant="light" />
            <Link
              to="/"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
          </div>

          <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center px-[var(--hwe-page-pad)]">
            <div className="flex min-w-0 flex-1 items-center justify-center py-6">
              <img
                src={heroVector}
                alt="Skilled worker and client connected through the platform"
                className="h-auto w-full object-contain drop-shadow-xl"
                decoding="async"
                loading="eager"
              />
            </div>

            <div className="pb-10 xl:pb-14">
              <h2 className="w-full text-2xl font-bold leading-tight xl:text-3xl">
                {tagline}
              </h2>
              {benefits?.length ? (
                <ul className="mt-5 space-y-2.5 text-sm text-white/85">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--hwe-highlight)]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 w-full flex-col items-stretch justify-center px-[var(--hwe-page-pad)] py-10 lg:bg-[var(--hwe-surface)] lg:py-16">
          <div className="w-full min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[var(--hwe-slate)] sm:text-3xl">{title}</h1>
              {subtitle ? (
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--hwe-muted)]">{subtitle}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[var(--hwe-border)] bg-[var(--hwe-surface)] p-5 shadow-[var(--hwe-shadow)] sm:p-6 lg:border-transparent lg:p-0 lg:shadow-none">
              {children}
            </div>

            {footer ? <div className="mt-5 text-center">{footer}</div> : null}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AuthLayout;
