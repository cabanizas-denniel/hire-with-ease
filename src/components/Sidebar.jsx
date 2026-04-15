import { NavLink } from 'react-router-dom';
import {AiOutlineClose} from 'react-icons/ai';

function Sidebar({ links = [], open, onClose }) {
  return (
    <>
      {open ? (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/30 lg:hidden"
          aria-label="Close sidebar"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-[51] w-72 max-w-[85vw] transform bg-white p-4 shadow-xl transition-transform lg:static lg:z-auto lg:h-auto lg:min-h-0 lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <p className="text-[20px] font-semibold text-[#1F4E79]">Navigation</p>
          <button type="button" onClick={onClose} className="rounded-md px-2 py-2 text-sm">
            <AiOutlineClose />
          </button>
        </div>

        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-[#1F4E79] text-white' : 'text-gray-700 hover:bg-gray-100'
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
