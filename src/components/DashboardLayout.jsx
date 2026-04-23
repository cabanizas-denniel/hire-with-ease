import { useMemo, useState } from 'react';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

const SIDEBAR_LINKS = {
  applicant: [
    { to: '/applicant/dashboard', label: 'Dashboard' },
    { to: '/applicant/profile', label: 'My Profile' },
    { to: '/applicant/jobs', label: 'Matched Jobs' },
    { to: '/applicant/applications', label: 'My Jobs' },
  ],
  employer: [
    { to: '/employer/dashboard', label: 'Dashboard' },
    { to: '/employer/profile', label: 'My Profile' },
    { to: '/employer/post-job', label: 'Request Service' },
    { to: '/employer/jobs', label: 'My Requests' },
    { to: '/employer/hired', label: 'Job History' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Analytics' },
    { to: '/admin/workers', label: 'Workers' },
    { to: '/admin/verification', label: 'Verification' },
    { to: '/admin/reports', label: 'Reports' },
  ],
};

function DashboardLayout({ role, children }) {
  const [open, setOpen] = useState(false);
  const links = useMemo(() => SIDEBAR_LINKS[role] || [], [role]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar links={links} onMenuClick={() => setOpen(true)} />
      <div className="mx-auto flex w-full max-w-7xl px-4 pb-4 sm:px-6">
        <div className="hidden lg:hidden">
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
