import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import BrandMark from './BrandMark.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * @typedef {Object} NavItem
 * @property {string} label
 * @property {string} [to] - in-app route (NavLink)
 * @property {string} [hash] - same-page anchor e.g. #section (plain <a>)
 */

function Navbar({ links = [], onMenuClick }) {
  const { isAuthenticated, role, logout, getDefaultRoute } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = 'text-sm font-medium text-gray-600 hover:text-[#2E75B6]';
  const activeClass = 'text-[#1F4E79]';

  const renderLink = (item) => {
    if (item.hash) {
      return (
        <a
          key={item.label}
          href={item.hash}
          className={linkClass}
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
        className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
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
              className="rounded-md border border-gray-300 p-2 text-gray-700 lg:hidden"
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
              className="rounded-md border border-gray-300 px-2 py-2 text-sm text-[#1F4E79]"
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
              <span className="hidden rounded-md bg-gray-100 px-2 py-1 text-xs capitalize text-gray-600 sm:inline-block">
                {role}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-[#1F4E79] px-3 py-2 text-sm font-medium text-white"
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

export default Navbar;
