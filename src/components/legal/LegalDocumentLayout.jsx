import { Link, NavLink } from 'react-router-dom';
import BrandMark from '../BrandMark.jsx';

const TABS = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms & Conditions' },
];

/**
 * Shared shell for public legal pages with Privacy / Terms tabs.
 */
function LegalDocumentLayout({ title, updatedLabel, children }) {
  return (
    <div className="min-h-screen bg-[var(--hwe-canvas)]">
      <header className="border-b border-[var(--hwe-slate)]/15 bg-[var(--hwe-strong)]">
        <div className="flex w-full min-w-0 items-center justify-between gap-3 px-[var(--hwe-page-pad)] py-4">
          <BrandMark to="/" variant="dark" />
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/login" className="btn-secondary px-3 py-1.5 text-xs">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary px-3 py-1.5 text-xs">
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full min-w-0 px-[var(--hwe-page-pad)] py-8 sm:py-10">
        <nav
          aria-label="Legal documents"
          className="mb-6 flex gap-1 rounded-xl border border-[var(--hwe-border)] bg-[var(--hwe-surface)] p-1 shadow-[var(--hwe-shadow)]"
        >
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[var(--hwe-slate)] text-[var(--hwe-on-slate)] shadow-sm'
                    : 'text-[var(--hwe-slate-soft)] hover:bg-[var(--hwe-canvas-deep)] hover:text-[var(--hwe-slate)]'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <h1 className="text-2xl font-bold text-[var(--hwe-slate)] sm:text-3xl">{title}</h1>
        {updatedLabel ? (
          <p className="mt-1 text-xs font-medium text-[var(--hwe-muted)]">{updatedLabel}</p>
        ) : null}

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--hwe-slate-soft)]">{children}</div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-[var(--hwe-border)] pt-6">
          <Link to="/" className="link-sky text-sm">
            ← Back to home
          </Link>
          <Link to="/register" className="link-sky text-sm">
            Create an account
          </Link>
        </div>
      </main>
    </div>
  );
}

function LegalSection({ title, children }) {
  return (
    <section className="card-surface p-5">
      <h2 className="text-base font-semibold text-[var(--hwe-slate)]">{title}</h2>
      <div className="mt-2 space-y-2 text-[var(--hwe-muted)]">{children}</div>
    </section>
  );
}

export { LegalSection };
export default LegalDocumentLayout;
