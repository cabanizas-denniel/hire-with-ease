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
    { to: '/applicant/dashboard', label: 'Home' },
    { to: '/applicant/profile', label: 'Profile' },
    { to: '/applicant/jobs', label: 'Jobs' },
    { to: '/applicant/applications', label: 'History' },
  ],
  employer: [
    { to: '/employer/dashboard', label: 'Home' },
    { to: '/employer/profile', label: 'Profile' },
    { to: '/employer/post-job', label: 'Request' },
    { to: '/employer/jobs', label: 'History' },
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
    <div className="hwe-shell relative min-h-screen">
      <Navbar links={links} onMenuClick={() => setOpen(true)} variant="app" />
      <Sidebar links={links} open={open} onClose={() => setOpen(false)} />
      <main className="w-full min-w-0 px-[var(--hwe-page-pad)] pb-8 pt-0">{children}</main>
    </div>
  );
}

export default DashboardLayout;
