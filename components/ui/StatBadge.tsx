interface StatBadgeProps {
  value: number | string;
  label: string;
}

/**
 * Homepage stat: a large bold value above a small muted label.
 * (e.g. "120" / "services listed")
 */
export function StatBadge({ value, label }: StatBadgeProps) {
  return (
    <div className="flex min-w-[7rem] flex-col items-center gap-0.5 rounded-2xl border border-black/5 bg-white px-6 py-3 text-center shadow-[var(--shadow-soft)]">
      <span className="text-3xl font-bold text-brand-peridot">{value}</span>
      <span className="text-sm font-medium text-gray-500">{label}</span>
    </div>
  );
}
