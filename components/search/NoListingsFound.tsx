import Image from 'next/image';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { toTitleCase } from '@/lib/titleCase';

export interface NoListingsFoundProps {
  city?: string;
  q?: string;
  vegOnly?: boolean;
  meals?: string[];
  days?: string[];
  containers?: string[];
  spices?: string[];
  minMealPrice?: number;
  maxMealPrice?: number;
  minMonthPrice?: number;
  maxMonthPrice?: number;
}

function buildEmptyStateSentence({
  city,
  q,
  vegOnly,
  meals = [],
  days = [],
  containers = [],
  spices = [],
  minMealPrice,
  maxMealPrice,
  minMonthPrice,
  maxMonthPrice,
}: NoListingsFoundProps): string {
  const cityDisplay = city ? toTitleCase(city) : undefined;
  const qDisplay = q ? toTitleCase(q) : undefined;
  const serviceType = vegOnly ? 'pure veg tiffin services' : 'tiffin services';

  let locationText = '';
  if (cityDisplay && qDisplay) {
    if (cityDisplay.toLowerCase() === qDisplay.toLowerCase()) {
      locationText = `in ${cityDisplay}`;
    } else {
      locationText = `in ${qDisplay}, ${cityDisplay}`;
    }
  } else if (cityDisplay) {
    locationText = `in ${cityDisplay}`;
  } else if (qDisplay) {
    locationText = `in ${qDisplay}`;
  } else {
    locationText = `in all locations`;
  }

  const filterClauses: string[] = [];

  if (meals.length > 0) {
    const mealLabels = meals
      .map((m) => {
        if (m === 'BREAKFAST') return 'Breakfast';
        if (m === 'LUNCH') return 'Lunch';
        if (m === 'DINNER') return 'Dinner';
        return m;
      })
      .join(' & ');
    filterClauses.push(`for ${mealLabels}`);
  }

  if (days.length > 0) {
    if (days.length === 7) {
      filterClauses.push(`on all days`);
    } else {
      const dayMap: Record<string, string> = {
        MON: 'Mon',
        TUE: 'Tue',
        WED: 'Wed',
        THU: 'Thu',
        FRI: 'Fri',
        SAT: 'Sat',
        SUN: 'Sun',
      };
      const dayLabels = days.map((d) => dayMap[d] || d).join(', ');
      filterClauses.push(`on ${dayLabels}`);
    }
  }

  if (containers.length > 0) {
    const containerMap: Record<string, string> = {
      STEEL: 'Steel',
      DISPOSABLE: 'Disposable',
    };
    const cLabels = containers.map((c) => containerMap[c] || c).join(' / ');
    filterClauses.push(`in ${cLabels} container${containers.length > 1 ? 's' : ''}`);
  }

  if (spices.length > 0) {
    const spiceMap: Record<string, string> = {
      MILD: 'Mild',
      MEDIUM: 'Normal',
      SPICY: 'Spicy',
    };
    const sLabels = spices.map((s) => spiceMap[s] || s).join(' / ');
    filterClauses.push(`with ${sLabels} spice level`);
  }

  if (minMealPrice !== undefined || maxMealPrice !== undefined) {
    if (minMealPrice !== undefined && maxMealPrice !== undefined) {
      filterClauses.push(`with price ₹${minMealPrice}–₹${maxMealPrice} per meal`);
    } else if (minMealPrice !== undefined) {
      filterClauses.push(`with price above ₹${minMealPrice} per meal`);
    } else if (maxMealPrice !== undefined) {
      filterClauses.push(`with price under ₹${maxMealPrice} per meal`);
    }
  }

  if (minMonthPrice !== undefined || maxMonthPrice !== undefined) {
    if (minMonthPrice !== undefined && maxMonthPrice !== undefined) {
      filterClauses.push(`with price ₹${minMonthPrice.toLocaleString('en-IN')}–₹${maxMonthPrice.toLocaleString('en-IN')} per month`);
    } else if (minMonthPrice !== undefined) {
      filterClauses.push(`with price above ₹${minMonthPrice.toLocaleString('en-IN')} per month`);
    } else if (maxMonthPrice !== undefined) {
      filterClauses.push(`with price under ₹${maxMonthPrice.toLocaleString('en-IN')} per month`);
    }
  }

  const extraFilters = filterClauses.length > 0 ? ` ${filterClauses.join(' ')}` : '';

  return `Uh oh! No ${serviceType} found ${locationText}${extraFilters}.`;
}

export function NoListingsFound(props: NoListingsFoundProps) {
  const sentence = buildEmptyStateSentence(props);

  const hasFiltersApplied =
    props.vegOnly ||
    (props.meals && props.meals.length > 0) ||
    (props.days && props.days.length > 0) ||
    (props.containers && props.containers.length > 0) ||
    (props.spices && props.spices.length > 0) ||
    props.minMealPrice !== undefined ||
    props.maxMealPrice !== undefined ||
    props.minMonthPrice !== undefined ||
    props.maxMonthPrice !== undefined ||
    !!props.q;

  // Clear filters URL (keep city if present, or clear completely)
  const clearFiltersUrl = props.city ? `/search?city=${encodeURIComponent(props.city)}` : '/search';

  return (
    <div className="w-full rounded-3xl border border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center gap-5">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 transition-transform duration-300 hover:scale-105">
        <Image
          src="/no_listing_image.png"
          alt="Empty tiffin container - No tiffin services found"
          fill
          sizes="(max-width: 640px) 192px, 224px"
          className="object-contain"
          priority
        />
      </div>

      <div className="flex flex-col items-center gap-2 max-w-lg">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          No Results Found
        </h3>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
          {sentence}
        </p>
      </div>

      {hasFiltersApplied && (
        <div className="mt-2">
          <Link
            href={clearFiltersUrl}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-peridot text-white font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
          >
            <RotateCcw size={16} />
            Clear Filters & Try Again
          </Link>
        </div>
      )}
    </div>
  );
}
