import { NavLink } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai';

function Sidebar({ links = [], open, onClose }) {
  return (
    <>
      {open ? (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-50 bg-[var(--hwe-slate)]/40 lg:hidden"
          aria-label="Close sidebar"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-[51] w-72 max-w-[85vw] transform border-r border-[var(--hwe-border)] bg-[var(--hwe-surface)] p-4 shadow-xl transition-transform lg:static lg:z-auto lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--hwe-muted)]">
            Menu
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--hwe-slate)] hover:bg-[var(--hwe-canvas-deep)]"
            aria-label="Close menu"
          >
            <AiOutlineClose className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="space-y-1" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[var(--hwe-strong)] text-[var(--hwe-slate)]'
                    : 'text-[var(--hwe-slate-soft)] hover:bg-[var(--hwe-canvas-deep)] hover:text-[var(--hwe-slate)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
