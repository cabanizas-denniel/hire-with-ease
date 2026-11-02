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
    <div className="min-h-screen bg-[#f0f3f7]">
      <header className="border-b border-[#1F4E79]/15 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <BrandMark to="/" variant="dark" />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#1F4E79] hover:bg-[#1F4E79]/5"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#1F4E79] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <nav
          aria-label="Legal documents"
          className="mb-6 flex gap-1 rounded-xl border border-[#1F4E79]/15 bg-white p-1 shadow-sm"
        >
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#1F4E79] text-white shadow-sm'
                    : 'text-[#1F4E79] hover:bg-[#1F4E79]/5'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <h1 className="text-2xl font-bold text-[#1F4E79] sm:text-3xl">{title}</h1>
        {updatedLabel ? (
          <p className="mt-1 text-xs font-medium text-gray-500">{updatedLabel}</p>
        ) : null}

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-700">{children}</div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-gray-200 pt-6">
          <Link to="/" className="text-sm font-semibold text-[#2E75B6] hover:underline">
            ← Back to home
          </Link>
          <Link to="/register" className="text-sm font-semibold text-[#2E75B6] hover:underline">
            Create an account
          </Link>
        </div>
      </main>
    </div>
  );
}

function LegalSection({ title, children }) {
  return (
    <section className="rounded-xl border border-[#1F4E79]/15 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-[#1F4E79]">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

export { LegalSection };
export default LegalDocumentLayout;
