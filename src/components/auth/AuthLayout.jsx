import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import BrandMark from '../BrandMark.jsx';
import heroVector from '../../assets/images/hero-vector-hire-with-ease.png';

/**
 * Two-pane auth shell used by Login & Register.
 *
 *  • Desktop (lg+): full-bleed split — illustration/brand panel on the left,
 *    form on the right, each owning half the viewport.
 *  • Mobile: stacks into form-first with a slim brand bar up top;
 *    the illustration panel is hidden to keep the form above the fold.
 *
 * The consumer provides `title`, `subtitle`, `tagline` (big phrase on the
 * blue side), `benefits` (bullet strip), and the form as `children`.
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
    <div className="min-h-dvh min-h-screen bg-white">
      {/* Mobile brand bar */}
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3 lg:hidden">
        <BrandMark to="/" variant="dark" />
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2E75B6] hover:text-[#2E75B6]"
        >
          <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
          Home
        </Link>
      </header>

      <div className="lg:grid lg:min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left: illustration + brand + pitch (desktop only) */}
        <aside className="relative hidden overflow-hidden bg-[#2E75B6] text-white lg:flex lg:flex-col">
          <div className="relative z-10 flex items-center justify-between px-10 pt-10 xl:px-14">
            <BrandMark to="/" variant="light" />
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center px-10 xl:px-14">
            <div className="flex flex-1 items-center justify-center py-6">
              <img
                src={heroVector}
                alt="Skilled worker and client connected through the platform"
                className="h-auto w-full max-w-md object-contain drop-shadow-xl xl:max-w-lg"
                decoding="async"
                loading="eager"
              />
            </div>

            <div className="pb-10 xl:pb-14">
              <h2 className="max-w-lg text-2xl font-bold leading-tight xl:text-3xl">
                {tagline}
              </h2>
              {benefits?.length ? (
                <ul className="mt-5 space-y-2.5 text-sm text-white/85">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white/80" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          {/* Subtle decorative blobs */}
          <div
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-white/5 blur-3xl"
            aria-hidden="true"
          />
        </aside>

        {/* Right: form */}
        <main className="flex flex-col items-center justify-center bg-gray-50 px-4 py-10 sm:px-6 lg:bg-white lg:px-10 lg:py-16 xl:px-16">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#2E75B6] sm:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1.5 text-sm text-gray-600">{subtitle}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 lg:border-transparent lg:p-0 lg:shadow-none">
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
