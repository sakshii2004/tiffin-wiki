interface VegIndicatorProps {
  isVegetarian: boolean;
  hasNonVeg: boolean;
}

type Variant = {
  label: string;
  dotClass: string;
  borderClass: string;
};

function resolve({ isVegetarian, hasNonVeg }: VegIndicatorProps): Variant {
  if (isVegetarian && !hasNonVeg) {
    return { label: 'Pure Veg', dotClass: 'bg-green-600', borderClass: 'border-green-600' };
  }
  if (isVegetarian && hasNonVeg) {
    return { label: 'Veg & Non-Veg', dotClass: 'bg-amber-500', borderClass: 'border-amber-500' };
  }
  return { label: 'Non-Veg', dotClass: 'bg-red-600', borderClass: 'border-red-600' };
}

/**
 * Veg / non-veg indicator. The text label is always present for screen readers
 * — colour and icon are supplementary, never the sole signal.
 */
export function VegIndicator(props: VegIndicatorProps) {
  const { label, dotClass, borderClass } = resolve(props);
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-body">
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 items-center justify-center rounded-sm border-2 ${borderClass}`}
      >
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      </span>
      {label}
    </span>
  );
}
