import { useMemo, useState } from 'react';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

const SIDEBAR_LINKS = {
  applicant: [
    { to: '/applicant/dashboard', label: 'Dashboard' },
    { to: '/applicant/profile', label: 'Profile' },
    { to: '/applicant/jobs', label: 'Jobs' },
    { to: '/applicant/applications', label: 'Applications' },
    { to: '/applicant/notifications', label: 'Notifications' },
  ],
  employer: [
    { to: '/employer/dashboard', label: 'Dashboard' },
    { to: '/employer/post-job', label: 'Post Job' },
    { to: '/employer/jobs', label: 'Posted Jobs' },
    { to: '/employer/hired', label: 'Hired Workers' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Analytics' },
    { to: '/admin/workers', label: 'Workers' },
    { to: '/admin/reports', label: 'Reports' },
  ],
};

function DashboardLayout({ role, children }) {
  const [open, setOpen] = useState(false);
  const links = useMemo(() => SIDEBAR_LINKS[role] || [], [role]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar links={links} onMenuClick={() => setOpen(true)} />
      <div className="mx-auto flex w-full max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:py-6">
        <div className="hidden lg:block">
          <Sidebar links={links} open={true} onClose={() => setOpen(false)} />
        </div>
        <div className="lg:hidden">
          <Sidebar links={links} open={open} onClose={() => setOpen(false)} />
        </div>
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
