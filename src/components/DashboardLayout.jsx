import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

const PROFILE_ROUTE_BY_ROLE = {
  applicant: '/applicant/profile',
  employer: '/employer/profile',
};

const SIDEBAR_LINKS = {
  applicant: [
    { to: '/applicant/profile', label: 'Profile' },
    { to: '/applicant/jobs', label: 'Matched Jobs' },
    { to: '/applicant/applications', label: 'My Jobs' },
  ],
  employer: [
    { to: '/employer/profile', label: 'Profile' },
    { to: '/employer/post-job', label: 'Request Service' },
    { to: '/employer/jobs', label: 'Requests' },
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
  const { user } = useAuth();
  const links = useMemo(() => {
    const base = SIDEBAR_LINKS[role] || [];
    const profileTo = PROFILE_ROUTE_BY_ROLE[role];
    if (!profileTo) return base;
    const displayName = user?.fullName?.trim();
    return base.map((link) =>
      link.to === profileTo ? { ...link, label: displayName || 'Profile' } : link
    );
  }, [role, user?.fullName]);

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
