import { Link } from 'react-router-dom';

/**
 * Compact app footer for public surfaces.
 */
function Footer({ className = '' }) {
  return (
    <footer
      className={`border-t border-[var(--hwe-border)] bg-[var(--hwe-surface)] ${className}`.trim()}
    >
      <div className="flex w-full min-w-0 flex-col gap-4 px-[var(--hwe-page-pad)] py-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--hwe-slate)]">Hire With Ease</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--hwe-muted)]">
            Matching skilled workers with clients in Olongapo.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Footer">
          <Link to="/privacy" className="link-sky">
            Privacy
          </Link>
          <Link to="/terms" className="link-sky">
            Terms
          </Link>
          <Link to="/login" className="link-sky">
            Sign in
          </Link>
        </nav>
      </div>
      <p className="border-t border-[var(--hwe-border)] py-4 text-center text-xs text-[var(--hwe-muted)]">
        &copy; {new Date().getFullYear()} Hire With Ease
      </p>
    </footer>
  );
}

export default Footer;
