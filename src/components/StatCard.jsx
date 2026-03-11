function StatCard({ label, value, helperText }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#1F4E79]">{value}</p>
      {helperText ? <p className="mt-1 text-sm text-gray-500">{helperText}</p> : null}
    </div>
  );
}

export default StatCard;
