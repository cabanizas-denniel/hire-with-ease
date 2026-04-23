import { useState } from 'react';
import { HiOutlineBell } from 'react-icons/hi2';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import BrandMark from './BrandMark.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getUnreadCount } from '../data/notifications.js';

const NOTIFICATION_ROUTE = {
  applicant: '/applicant/notifications',
  employer: '/employer/notifications',
};

function Navbar({ links = [], onMenuClick }) {
  const { isAuthenticated, role, logout, getDefaultRoute } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    return (
      <NavLink
        key={item.label + (item.to || '')}
        to={item.to}
        end
        className={({ isActive }) => (isActive ? linkActive : linkInactive)}
        onClick={() => setMobileOpen(false)}
      >
        {item.label}
      </NavLink>
    );
  };

  const showMobileNav = links.length > 0 && !onMenuClick;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
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
                  unread={getUnreadCount(role)}
                />
              ) : null}
              <span className="hidden rounded-md bg-gray-100 px-2 py-1 text-xs capitalize text-gray-600 sm:inline-block">
                {role}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-[#1F4E79] px-3 py-2 text-sm font-medium text-white cursor-pointer"
              >
                Logout
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
  );
}

function NotificationBell({ to, unread = 0 }) {
  const hasUnread = unread > 0;
  const badge = unread > 9 ? '9+' : String(unread);
  return (
    <NavLink
      to={to}
      end
      aria-label={hasUnread ? `Notifications, ${unread} unread` : 'Notifications'}
      title="Notifications"
      className={({ isActive }) =>
        `relative inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E79] focus-visible:ring-offset-1 ${
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
  );
}

export default Navbar;
