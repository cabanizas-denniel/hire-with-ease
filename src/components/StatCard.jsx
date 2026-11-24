function StatCard({ label, value, helperText }) {
  return (
    <div className="card-surface min-w-0 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--hwe-muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--hwe-slate)]">{value}</p>
      {helperText ? (
        <p className="mt-1 text-sm text-[var(--hwe-muted)]">{helperText}</p>
      ) : null}
    </div>
  );
}

export default StatCard;
