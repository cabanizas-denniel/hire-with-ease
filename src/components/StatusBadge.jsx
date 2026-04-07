const STATUS_STYLES = {
  Matching: 'bg-amber-100 text-amber-800',
  Matched: 'bg-blue-100 text-blue-800',
  Accepted: 'bg-teal-100 text-teal-800',
  Declined: 'bg-gray-100 text-gray-500',
  'In Progress': 'bg-indigo-100 text-indigo-800',
  Completed: 'bg-green-100 text-green-800',
  Open: 'bg-gray-100 text-gray-700',
  Pending: 'bg-yellow-100 text-yellow-800',
};

function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
