import { useState } from 'react';
import { HiOutlineArrowRightOnRectangle, HiOutlineBell, HiOutlineUserCircle } from 'react-icons/hi2';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import AdminAccountModal from './admin/AdminAccountModal.jsx';
import BrandMark from './BrandMark.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotificationsOptional } from '../context/NotificationsContext.jsx';

const NOTIFICATION_ROUTE = {
  applicant: '/applicant/notifications',
  employer: '/employer/notifications',
  admin: '/admin/notifications',
};

function Navbar({ links = [], onMenuClick, variant = 'app' }) {
  const { isAuthenticated, role, logout, getDefaultRoute } = useAuth();
  const notifications = useNotificationsOptional();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const unreadCount = notifications?.unreadCount ?? 0;
  const isApp = variant === 'app';

  const handleLogout = () => {
    if (!window.confirm('Log out of Hire With Ease?')) return;
    logout();
    navigate('/login');
  };

  const linkInactive = isApp
    ? 'inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white'
    : 'inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-[var(--hwe-slate-soft)] transition-colors hover:bg-[var(--hwe-strong-soft)] hover:text-[var(--hwe-slate)]';
  const linkActive = isApp
    ? 'inline-flex items-center rounded-lg bg-[var(--hwe-strong)] px-2.5 py-1.5 text-sm font-semibold text-[var(--hwe-slate)]'
    : 'inline-flex items-center rounded-lg bg-[var(--hwe-slate)] px-2.5 py-1.5 text-sm font-semibold text-[var(--hwe-on-slate)]';

  const renderLink = (item) => {
    if (item.hash) {
      return (
        <a
          key={item.label}
          href={item.hash}
          className={linkInactive}
          onClick={() => setMobileOpen(false)}
        >
          {item.label}
        </a>
      );
    }
    const profilePaths = ['/employer/profile', '/applicant/profile'];
    return (
      <NavLink
        key={item.to || item.label}
        to={item.to}
        end={!profilePaths.includes(item.to)}
        className={({ isActive }) => (isActive ? linkActive : linkInactive)}
        onClick={() => setMobileOpen(false)}
      >
        <span className="max-w-[10rem] truncate sm:max-w-[14rem]">{item.label}</span>
      </NavLink>
    );
  };

  const showMobileNav = links.length > 0 && !onMenuClick;

  return (
    <>
      <header
        className={`sticky top-0 z-40 ${
          isApp
            ? 'border-b border-white/10 bg-[var(--hwe-slate)]'
            : 'border-b border-[var(--hwe-slate)]/15 bg-[var(--hwe-strong)]'
        }`}
      >
        <div className="flex w-full min-w-0 items-center justify-between gap-3 px-[var(--hwe-page-pad)] py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {onMenuClick ? (
              <button
                type="button"
                onClick={onMenuClick}
                className={`cursor-pointer rounded-lg border p-2 lg:hidden ${
                  isApp
                    ? 'border-white/25 text-white hover:bg-white/10'
                    : 'border-[var(--hwe-slate)]/25 text-[var(--hwe-slate)] hover:bg-black/5'
                }`}
                aria-label="Open menu"
              >
                ☰
              </button>
            ) : null}
            <BrandMark
              to={isAuthenticated ? getDefaultRoute() : '/'}
              variant={isApp || !isAuthenticated ? (isApp ? 'light' : 'dark') : 'dark'}
              className="min-w-0 max-w-[calc(100%-3rem)] sm:max-w-none"
            />
          </div>

          <nav className="hidden flex-wrap items-center justify-center gap-x-1 gap-y-1 md:flex" aria-label="Primary">
            {links.map((item) => renderLink(item))}
          </nav>

          {showMobileNav ? (
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className={`cursor-pointer rounded-lg border px-2.5 py-2 text-sm ${
                  isApp
                    ? 'border-white/25 text-white'
                    : 'border-[var(--hwe-slate)]/25 text-[var(--hwe-slate)]'
                }`}
                aria-expanded={mobileOpen}
                aria-label="Toggle menu"
                onClick={() => setMobileOpen((o) => !o)}
              >
                ☰
              </button>
            </div>
          ) : null}

          <div className="flex shrink-0 items-center gap-2">
            {isAuthenticated ? (
              <>
                {NOTIFICATION_ROUTE[role] ? (
                  <NotificationBell
                    to={NOTIFICATION_ROUTE[role]}
                    unread={unreadCount}
                    items={notifications?.items || []}
                    loading={notifications?.loading}
                    onMarkAsRead={notifications?.markAsRead}
                    dark={isApp}
                  />
                ) : null}
                {role === 'admin' ? (
                  <AdminProfileButton onOpenAccount={() => setAccountModalOpen(true)} dark={isApp} />
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  title="Log out"
                  className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hwe-strong)] focus-visible:ring-offset-1 ${
                    isApp
                      ? 'border-white/25 bg-white/10 text-white hover:bg-white/20'
                      : 'border-[var(--hwe-slate)]/20 bg-[var(--hwe-slate)] text-[var(--hwe-on-slate)] hover:bg-[var(--hwe-slate-mid)]'
                  }`}
                >
                  <HiOutlineArrowRightOnRectangle className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3 py-2 text-sm ${isApp ? 'btn-ghost text-white hover:bg-white/10' : 'btn-secondary'}`}
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-3 py-2 text-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {showMobileNav && mobileOpen ? (
          <div
            className={`border-t px-[var(--hwe-page-pad)] py-3 md:hidden ${
              isApp ? 'border-white/10 bg-[var(--hwe-slate-mid)]' : 'border-[var(--hwe-slate)]/10 bg-[var(--hwe-strong-hover)]'
            }`}
          >
            <div className="flex flex-col gap-1">{links.map((item) => renderLink(item))}</div>
          </div>
        ) : null}
      </header>

      {role === 'admin' ? (
        <AdminAccountModal
          isOpen={accountModalOpen}
          onClose={() => setAccountModalOpen(false)}
        />
      ) : null}
    </>
  );
}

const navIconButtonClass =
  'inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hwe-sky)] focus-visible:ring-offset-1';

function AdminProfileButton({ onOpenAccount, dark = false }) {
  return (
    <button
      type="button"
      onClick={onOpenAccount}
      aria-label="Account settings"
      title="Account"
      className={`${navIconButtonClass} ${
        dark
          ? 'border-white/25 bg-white/10 text-white hover:bg-white/20'
          : 'border-[var(--hwe-border-strong)] bg-[var(--hwe-surface)] text-[var(--hwe-slate-soft)] hover:text-[var(--hwe-slate)]'
      }`}
    >
      <HiOutlineUserCircle className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

function NotificationBell({
  to,
  unread = 0,
  items = [],
  loading = false,
  onMarkAsRead,
  dark = false,
}) {
  const hasUnread = unread > 0;
  const badge = unread > 9 ? '9+' : String(unread);
  const preview = items.slice(0, 5);

  return (
    <div className="group relative">
      <NavLink
        to={to}
        end
        aria-label={hasUnread ? `Notifications, ${unread} unread` : 'Notifications'}
        title="Notifications"
        className={({ isActive }) =>
          `relative ${navIconButtonClass} ${
            isActive
              ? 'border-[var(--hwe-highlight)]/50 bg-[var(--hwe-highlight)] text-[var(--hwe-slate)]'
              : dark
                ? 'border-white/25 bg-white/10 text-white hover:bg-white/20'
                : 'border-[var(--hwe-border-strong)] bg-[var(--hwe-surface)] text-[var(--hwe-slate-soft)] hover:text-[var(--hwe-slate)]'
          }`
        }
      >
        <HiOutlineBell className="h-5 w-5" aria-hidden="true" />
        {hasUnread ? (
          <span
            className="highlight-pill absolute -right-1 -top-1 min-h-[18px] min-w-[18px] px-1 ring-2 ring-[var(--hwe-slate)]"
            aria-hidden="true"
          >
            {badge}
          </span>
        ) : null}
      </NavLink>

      <div
        className="invisible absolute right-0 z-50 w-[min(22rem,calc(100vw-1.5rem))] pt-2 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        role="menu"
        aria-label="Notifications preview"
      >
        <div className="overflow-hidden rounded-xl border border-[var(--hwe-border)] bg-[var(--hwe-surface)] shadow-[var(--hwe-shadow)]">
          <div className="border-b border-[var(--hwe-border)] px-3 py-2">
            <p className="text-xs font-semibold text-[var(--hwe-slate)]">Notifications</p>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-4 text-center text-xs text-[var(--hwe-muted)]">Loading…</p>
            ) : preview.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-[var(--hwe-muted)]">
                No notifications yet.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--hwe-border)]">
                {preview.map((item) => (
                  <li key={item.id}>
                    {item.linkTo ? (
                      <Link
                        to={item.linkTo}
                        onClick={() => {
                          if (item.unread && onMarkAsRead) void onMarkAsRead(item.id);
                        }}
                        className="block cursor-pointer px-3 py-2.5 text-left hover:bg-[var(--hwe-canvas-deep)]"
                        role="menuitem"
                      >
                        <NotificationPreviewRow item={item} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (item.unread && onMarkAsRead) void onMarkAsRead(item.id);
                        }}
                        className="block w-full cursor-pointer px-3 py-2.5 text-left hover:bg-[var(--hwe-canvas-deep)]"
                        role="menuitem"
                      >
                        <NotificationPreviewRow item={item} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-[var(--hwe-border)] bg-[var(--hwe-canvas-deep)]">
            <Link
              to={to}
              className="block cursor-pointer px-3 py-2.5 text-center text-xs font-semibold text-[var(--hwe-sky)] hover:bg-[var(--hwe-sky-soft)]"
              role="menuitem"
            >
              View all
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationPreviewRow({ item }) {
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-semibold text-[var(--hwe-slate)]">{item.title}</p>
          {item.unread ? (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--hwe-sky)]"
              aria-hidden="true"
            />
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--hwe-muted)]">{item.message}</p>
      </div>
      <span className="shrink-0 text-[10px] text-[var(--hwe-muted)]">{item.time}</span>
    </div>
  );
}

export default Navbar;
