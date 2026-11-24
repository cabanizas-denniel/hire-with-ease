function SkillBadge({ skill }) {
  return (
    <span className="rounded-full bg-[var(--hwe-sky-soft)] px-3 py-1 text-xs font-medium text-[var(--hwe-slate)]">
      {skill}
    </span>
  );
}

export default SkillBadge;
