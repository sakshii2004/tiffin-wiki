'use client';

import { useRouter } from 'next/navigation';

interface FilterBarProps {
  currentCity?: string;
  currentMeal?: string;
  currentVeg?: boolean;
  currentQ?: string;
}

const MEALS: { value: string; label: string }[] = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
];

/** Builds a /search URL from the given params, dropping empty values. */
function buildSearchUrl(params: Record<string, string | undefined>): string {
  const url = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') url.set(k, v);
  });
  const qs = url.toString();
  return qs ? `/search?${qs}` : '/search';
}

/**
 * URL-driven filter bar. Holds NO client filter state — every change navigates
 * via router.push() with updated search params. The parent search page (a
 * Server Component) passes the current values as props so the controls render
 * in their correct active state on first paint.
 */
export function FilterBar({ currentCity, currentMeal, currentVeg, currentQ }: FilterBarProps) {
  const router = useRouter();

  function navigate(next: Partial<Record<'city' | 'q' | 'meal' | 'veg', string | undefined>>) {
    // page is intentionally reset (omitted) on any filter change.
    router.push(
      buildSearchUrl({
        city: currentCity,
        q: currentQ,
        meal: currentMeal,
        veg: currentVeg ? 'true' : undefined,
        ...next,
      }),
    );
  }

  const cityDisplay = currentCity ? currentCity.charAt(0).toUpperCase() + currentCity.slice(1) : '';

  return (
    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
      {/* Active city chip (dismissible) */}
      {currentCity && (
        <>
          <button
            type="button"
            onClick={() => navigate({ city: undefined })}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full bg-brand-peridot/20 px-3 text-sm font-medium text-body hover:bg-brand-peridot/30"
            aria-label={`Remove city filter ${cityDisplay}`}
          >
            {cityDisplay}
            <span aria-hidden="true">×</span>
          </button>

          <span aria-hidden="true" className="h-6 w-px shrink-0 bg-gray-200" />
        </>
      )}

      {/* Meal toggles */}
      {MEALS.map(({ value, label }) => {
        const active = currentMeal === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => navigate({ meal: active ? undefined : value })}
            className={`inline-flex min-h-[44px] shrink-0 items-center rounded-full px-3 text-sm font-medium ${
              active
                ? 'bg-brand-peridot text-white'
                : 'border border-gray-300 text-body hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        );
      })}

      {/* Veg-only toggle */}
      <button
        type="button"
        aria-pressed={!!currentVeg}
        onClick={() => navigate({ veg: currentVeg ? undefined : 'true' })}
        className={`inline-flex min-h-[44px] shrink-0 items-center rounded-full px-3 text-sm font-medium ${
          currentVeg
            ? 'bg-green-600 text-white'
            : 'border border-gray-300 text-body hover:bg-gray-50'
        }`}
      >
        Veg only
      </button>
    </div>
  );
}
