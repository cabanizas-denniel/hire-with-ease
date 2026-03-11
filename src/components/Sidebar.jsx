import { NavLink } from 'react-router-dom';

function Sidebar({ links = [], open, onClose }) {
  return (
    <>
      {open ? (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          aria-label="Close sidebar"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-40 h-full w-72 transform bg-white p-4 shadow-xl transition-transform lg:static lg:h-auto lg:w-64 lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <p className="text-base font-semibold text-[#1F4E79]">Navigation</p>
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-2 py-1 text-sm">
            Close
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
