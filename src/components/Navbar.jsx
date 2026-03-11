import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar({ links = [], onMenuClick }) {
  const { isAuthenticated, role, logout, getDefaultRoute } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {onMenuClick ? (
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-md border border-gray-300 p-2 text-gray-700 lg:hidden"
              aria-label="Open menu"
            >
              ?
            </button>
          ) : null}
          <Link to={isAuthenticated ? getDefaultRoute() : '/'} className="text-lg font-bold text-[#1F4E79]">
            Hire With Ease
          </Link>
        </div>

        <nav className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-[#1F4E79]' : 'text-gray-600 hover:text-[#2E75B6]'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
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
    </header>
  );
}

export default Navbar;
