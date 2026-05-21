import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import { useNotifications } from '../../context/NotificationsContext.jsx';

const TYPE_STYLES = {
  match: 'border-l-[#2E75B6]',
  status: 'border-l-teal-500',
  rating: 'border-l-amber-400',
  verification: 'border-l-emerald-500',
  system: 'border-l-gray-400',
};

const ACTION_BY_TYPE = {
  match: { label: 'View Matches', to: '/employer/jobs' },
  status: { label: 'Review Job', to: '/employer/jobs' },
  verification: { label: 'Open Profile', to: '/employer/profile' },
};

function EmployerNotificationsPage() {
  const { items, loading, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (!items.some((n) => n.unread)) return;
    void markAllAsRead();
  }, [items, markAllAsRead]);

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Worker matches, job updates, and verification alerts from PESO."
      />

      <div className="space-y-3">
        {loading ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            Loading notifications…
          </p>
        ) : null}
        {!loading
          ? items.map((item) => {
              const action = item.linkTo
                ? { label: 'Open', to: item.linkTo }
                : ACTION_BY_TYPE[item.type];
              return (
                <article
                  key={item.id}
                  className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ${TYPE_STYLES[item.type] || 'border-l-gray-300'} ${
                    item.unread ? 'ring-1 ring-[#2E75B6]/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-[#1F4E79]">
                          {item.title}
                        </h3>
                        {item.unread ? (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#2E75B6]" />
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">
                      {item.time}
                    </span>
                  </div>
                  {action ? (
                    <div className="mt-3">
                      <Link
                        to={action.to}
                        className="inline-block rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-medium text-white"
                      >
                        {action.label}
                      </Link>
                    </div>
                  ) : null}
                </article>
              );
            })
          : null}
        {!loading && items.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            You're all caught up. New matches and verification updates will appear here.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default EmployerNotificationsPage;
