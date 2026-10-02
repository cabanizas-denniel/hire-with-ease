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

function Navbar({ links = [], onMenuClick }) {
  const { isAuthenticated, role, logout, getDefaultRoute } = useAuth();
  const notifications = useNotificationsOptional();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const unreadCount = notifications?.unreadCount ?? 0;

  const handleLogout = () => {
    if (!window.confirm('Log out of Hire With Ease?')) return;
    logout();
    navigate('/login');
  };

  const linkBase =
    'inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#1F4E79]';
  const linkInactive = linkBase;
  const linkActive = `${linkBase} bg-[#1F4E79]/10 font-semibold text-[#1F4E79] ring-1 ring-[#1F4E79]/15`;

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
    <header className="sticky top-0 z-40 border-b border-white/30 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {onMenuClick ? (
            <button
              type="button"
              onClick={onMenuClick}
              className="cursor-pointer rounded-md border border-gray-300 p-2 text-gray-700 lg:hidden"
              aria-label="Open menu"
            >
              ☰
            </button>
          ) : null}
          <BrandMark
            to={isAuthenticated ? getDefaultRoute() : '/'}
            variant="dark"
            className="min-w-0 max-w-[calc(100%-3rem)] sm:max-w-none"
          />
        </div>

        <nav className="hidden flex-wrap items-center justify-center gap-x-5 gap-y-1 md:flex">
          {links.map((item) => renderLink(item))}
        </nav>

        {showMobileNav ? (
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="cursor-pointer rounded-md border border-gray-300 px-2 py-2 text-sm text-[#1F4E79]"
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
                />
              ) : null}
              {role === 'admin' ? (
                <AdminProfileButton onOpenAccount={() => setAccountModalOpen(true)} />
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#1F4E79] bg-[#1F4E79] text-white transition-colors hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E79] focus-visible:ring-offset-1"
              >
                <HiOutlineArrowRightOnRectangle className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg border border-[#1F4E79] px-3 py-2 text-sm font-medium text-[#1F4E79]">
                Login
              </Link>
              <Link to="/register" className="rounded-lg bg-[#1F4E79] px-3 py-2 text-sm font-medium text-white">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {showMobileNav && mobileOpen ? (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">{links.map((item) => renderLink(item))}</div>
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
  'inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E79] focus-visible:ring-offset-1';

function AdminProfileButton({ onOpenAccount }) {
  return (
    <button
      type="button"
      onClick={onOpenAccount}
      aria-label="Account settings"
      title="Account"
      className={`${navIconButtonClass} border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-[#1F4E79]`}
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
              ? 'border-[#1F4E79]/30 bg-[#1F4E79]/10 text-[#1F4E79]'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-[#1F4E79]'
          }`
        }
      >
        <HiOutlineBell className="h-5 w-5" aria-hidden="true" />
        {hasUnread ? (
          <span
            className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
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
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black/5">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="text-xs font-semibold text-[#1F4E79]">Notifications</p>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-4 text-center text-xs text-gray-500">Loading…</p>
            ) : preview.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-gray-500">No notifications yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {preview.map((item) => (
                  <li key={item.id}>
                    {item.linkTo ? (
                      <Link
                        to={item.linkTo}
                        onClick={() => {
                          if (item.unread && onMarkAsRead) void onMarkAsRead(item.id);
                        }}
                        className="block cursor-pointer px-3 py-2.5 text-left hover:bg-gray-50"
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
                        className="block w-full cursor-pointer px-3 py-2.5 text-left hover:bg-gray-50"
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

          <div className="border-t border-gray-100 bg-gray-50">
            <Link
              to={to}
              className="block cursor-pointer px-3 py-2.5 text-center text-xs font-semibold text-[#1F4E79] hover:bg-gray-100"
              role="menuitem"
            >
              View History
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
          <p className="truncate text-xs font-semibold text-gray-900">{item.title}</p>
          {item.unread ? (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2E75B6]" aria-hidden="true" />
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-600">{item.message}</p>
      </div>
      <span className="shrink-0 text-[10px] text-gray-400">{item.time}</span>
    </div>
  );
}

export default Navbar;
