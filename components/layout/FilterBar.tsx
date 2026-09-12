'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelemetry } from '@/components/providers/TelemetryProvider';
import { FilterDropdown } from './FilterDropdown';
import { DualRangeSlider } from './DualRangeSlider';
import { cn } from '@/lib/cn';
import { FOCUS_RING } from '@/components/ui/styles';
import { X, Leaf, Soup, CalendarDays, IndianRupee, ReceiptIndianRupee } from 'lucide-react';
import { toTitleCase } from '@/lib/titleCase';

function PaperBagIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      <path d="M5 8h14l1 13H4L5 8z" />
      <path d="M4 18h16" />
    </svg>
  );
}

function ChiliIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 7c0 5-2 11-5 15c3-1 11-5 13-15c-1-1-2-2-2.5-2.5c0-1.5-.5-2.5-1-2.5c-.5 0-1 1-1 2.5C10 5 9 6 8 7z" />
      <path d="M8 7l2-1.5l2 3l2-3l2 1.5" />
      <path d="M7.8 11.5c-.3 1.5-.8 3-1.3 4.5" />
      <path d="M5.8 17.5c-.2.6-.4 1.2-.5 1.5" />
    </svg>
  );
}

interface FilterBarProps {
  currentCity?: string;
  currentQ?: string;
  currentVeg?: boolean;
  currentMeals?: string[];
  currentDays?: string[];
  currentContainers?: string[];
  currentSpices?: string[];
  currentMinMealPrice?: number;
  currentMaxMealPrice?: number;
  currentMinMonthPrice?: number;
  currentMaxMonthPrice?: number;
}

const MEALS_OPTIONS = [
  { label: 'Breakfast', value: 'BREAKFAST' },
  { label: 'Lunch', value: 'LUNCH' },
  { label: 'Dinner', value: 'DINNER' },
];

const DAYS_OPTIONS = [
  { label: 'Mon', value: 'MON' },
  { label: 'Tue', value: 'TUE' },
  { label: 'Wed', value: 'WED' },
  { label: 'Thu', value: 'THU' },
  { label: 'Fri', value: 'FRI' },
  { label: 'Sat', value: 'SAT' },
  { label: 'Sun', value: 'SUN' },
];

const CONTAINER_OPTIONS = [
  { label: 'Steel', value: 'STEEL' },
  { label: 'Disposable', value: 'DISPOSABLE' },
];

const SPICE_OPTIONS = [
  { label: 'Mild', value: 'MILD' },
  { label: 'Normal', value: 'MEDIUM' },
  { label: 'Spicy', value: 'SPICY' },
];

function buildSearchUrl(params: Record<string, string | undefined>): string {
  const url = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') url.set(k, v);
  });
  const qs = url.toString();
  return qs ? `/search?${qs}` : '/search';
}

export function FilterBar({
  currentCity,
  currentQ,
  currentVeg,
  currentMeals = [],
  currentDays = [],
  currentContainers = [],
  currentSpices = [],
  currentMinMealPrice,
  currentMaxMealPrice,
  currentMinMonthPrice,
  currentMaxMonthPrice,
}: FilterBarProps) {
  const router = useRouter();
  const { trackEvent } = useTelemetry();

  // Local state for dropdown filters to support "Apply" button
  const [meals, setMeals] = useState<string[]>(currentMeals);
  const [days, setDays] = useState<string[]>(currentDays);
  const [containers, setContainers] = useState<string[]>(currentContainers);
  const [spices, setSpices] = useState<string[]>(currentSpices);

  // Price range local state
  const [minMeal, setMinMeal] = useState<number>(currentMinMealPrice ?? 0);
  const [maxMeal, setMaxMeal] = useState<number>(currentMaxMealPrice ?? 500);
  const [minMonth, setMinMonth] = useState<number>(currentMinMonthPrice ?? 0);
  const [maxMonth, setMaxMonth] = useState<number>(currentMaxMonthPrice ?? 10000);

  // Sync state with props when page searchParams change
  useEffect(() => { setMeals(currentMeals); }, [JSON.stringify(currentMeals)]);
  useEffect(() => { setDays(currentDays); }, [JSON.stringify(currentDays)]);
  useEffect(() => { setContainers(currentContainers); }, [JSON.stringify(currentContainers)]);
  useEffect(() => { setSpices(currentSpices); }, [JSON.stringify(currentSpices)]);

  useEffect(() => {
    setMinMeal(currentMinMealPrice ?? 0);
    setMaxMeal(currentMaxMealPrice ?? 500);
  }, [currentMinMealPrice, currentMaxMealPrice]);

  useEffect(() => {
    setMinMonth(currentMinMonthPrice ?? 0);
    setMaxMonth(currentMaxMonthPrice ?? 10000);
  }, [currentMinMonthPrice, currentMaxMonthPrice]);

  const applyFilters = (overrides?: Partial<Record<string, string | number | boolean | undefined>>) => {
    const activeVeg = overrides?.veg !== undefined ? (overrides.veg === 'true' || overrides.veg === true) : currentVeg;
    const activeMeals = overrides?.meals !== undefined 
      ? (overrides.meals ? String(overrides.meals).split(',') : []) 
      : meals;
    const activeDays = overrides?.days !== undefined 
      ? (overrides.days ? String(overrides.days).split(',') : []) 
      : days;
    const activeContainers = overrides?.containers !== undefined 
      ? (overrides.containers ? String(overrides.containers).split(',') : []) 
      : containers;
    const activeSpices = overrides?.spices !== undefined 
      ? (overrides.spices ? String(overrides.spices).split(',') : []) 
      : spices;

    const params: Record<string, string | undefined> = {
      city: currentCity,
      q: currentQ,
      veg: activeVeg ? 'true' : undefined,
      meals: activeMeals.length > 0 ? activeMeals.join(',') : undefined,
      days: activeDays.length > 0 ? activeDays.join(',') : undefined,
      containers: activeContainers.length > 0 ? activeContainers.join(',') : undefined,
      spices: activeSpices.length > 0 ? activeSpices.join(',') : undefined,
      minMealPrice: minMeal > 0 || maxMeal < 500 ? String(minMeal) : undefined,
      maxMealPrice: minMeal > 0 || maxMeal < 500 ? String(maxMeal) : undefined,
      minMonthPrice: minMonth > 0 || maxMonth < 10000 ? String(minMonth) : undefined,
      maxMonthPrice: minMonth > 0 || maxMonth < 10000 ? String(maxMonth) : undefined,
    };

    if (overrides) {
      Object.entries(overrides).forEach(([k, v]) => {
        if (v === undefined) {
          params[k] = undefined;
        } else if (typeof v === 'boolean') {
          params[k] = v ? 'true' : undefined;
        } else {
          params[k] = String(v);
        }
      });
    }

    if (activeVeg !== undefined) {
      trackEvent('FILTER_TOGGLE', { filterName: 'veg', filterValue: String(activeVeg) });
    }
    activeMeals.forEach((m) => {
      trackEvent('FILTER_TOGGLE', { filterName: 'meals', filterValue: m });
    });
    activeContainers.forEach((c) => {
      trackEvent('FILTER_TOGGLE', { filterName: 'containers', filterValue: c });
    });
    activeSpices.forEach((s) => {
      trackEvent('FILTER_TOGGLE', { filterName: 'spices', filterValue: s });
    });

    router.push(buildSearchUrl(params));
  };

  const clearCity = () => {
    applyFilters({ city: undefined });
  };

  const clearAllFilters = () => {
    setMeals([]);
    setDays([]);
    setContainers([]);
    setSpices([]);
    setMinMeal(0);
    setMaxMeal(500);
    setMinMonth(0);
    setMaxMonth(10000);

    applyFilters({
      veg: undefined,
      meals: undefined,
      days: undefined,
      containers: undefined,
      spices: undefined,
      minMealPrice: undefined,
      maxMealPrice: undefined,
      minMonthPrice: undefined,
      maxMonthPrice: undefined,
    });
  };

  const handleMealChange = (val: string) => {
    setMeals((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const handleDayChange = (val: string) => {
    setDays((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const handleContainerChange = (val: string) => {
    setContainers((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const handleSpiceChange = (val: string) => {
    setSpices((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  // Generate pretty labels for filters
  const renderPills = (
    list: string[],
    options: { label: string; value: string }[],
    fallback: string,
    activeColor: 'green' | 'orange'
  ) => {
    if (list.length === 0) return fallback;

    return (
      <span className="flex flex-nowrap gap-1 items-center max-w-full">
        {list.map((v) => {
          const opt = options.find((o) => o.value === v);
          const label = opt ? opt.label : v;
          return (
            <span
              key={v}
              className={cn(
                "px-1.5 py-0.5 rounded-md text-[10px] font-medium shrink-0 select-none",
                activeColor === 'green'
                  ? 'bg-[#6aa337]/15 text-[#6aa337]'
                  : 'bg-[#b85c38]/15 text-[#b85c38]'
              )}
            >
              {label}
            </span>
          );
        })}
      </span>
    );
  };

  const renderMealsLabel = () => {
    if (meals.length === 0) return 'Type of Meal';
    if (meals.length === MEALS_OPTIONS.length) {
      return (
        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#6aa337]/15 text-[#6aa337] select-none shrink-0">
          All Meals
        </span>
      );
    }
    return renderPills(meals, MEALS_OPTIONS, 'Type of Meal', 'green');
  };

  const renderDaysLabel = () => {
    if (days.length === 0) return 'Operational Days';
    const totalSelected = days.length;

    if (totalSelected === 7) {
      return (
        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#6aa337]/15 text-[#6aa337] select-none shrink-0">
          All Days
        </span>
      );
    }

    if (totalSelected <= 5) {
      return renderPills(days, DAYS_OPTIONS, 'Operational Days', 'green');
    }

    const sortedSelected = DAYS_OPTIONS
      .filter((opt) => days.includes(opt.value))
      .map((opt) => opt.value);

    const maxVisible = 4;
    const visibleDays = sortedSelected.slice(0, maxVisible);
    const remainingCount = sortedSelected.length - maxVisible;

    return (
      <span className="flex flex-nowrap gap-1 items-center max-w-full">
        {visibleDays.map((v) => {
          const opt = DAYS_OPTIONS.find((o) => o.value === v);
          const label = opt ? opt.label : v;
          return (
            <span
              key={v}
              className="px-1.5 py-0.5 rounded-md text-[10px] font-medium shrink-0 bg-[#6aa337]/15 text-[#6aa337] select-none"
            >
              {label}
            </span>
          );
        })}
        {remainingCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium shrink-0 bg-slate-100 text-slate-600 select-none border border-slate-200/50">
            +{remainingCount}
          </span>
        )}
      </span>
    );
  };

  const mealLabel = renderMealsLabel();
  const dayLabel = renderDaysLabel();
  const containerLabel = renderPills(containers, CONTAINER_OPTIONS, 'Container Type', 'green');
  const spiceLabel = renderPills(spices, SPICE_OPTIONS, 'Spice Level', 'green');

  const isMealActive = meals.length > 0;
  const isDayActive = days.length > 0;
  const isContainerActive = containers.length > 0;
  const isSpiceActive = spices.length > 0;

  const isMealPriceActive = minMeal > 0 || maxMeal < 500;
  const isMonthPriceActive = minMonth > 0 || maxMonth < 10000;

  const hasActiveFilters =
    currentVeg === true ||
    isMealActive ||
    isDayActive ||
    isContainerActive ||
    isSpiceActive ||
    isMealPriceActive ||
    isMonthPriceActive;

  const mealPriceLabel = isMealPriceActive ? `₹${minMeal} - ₹${maxMeal}` : 'Price per Meal';
  const monthPriceLabel = isMonthPriceActive ? `₹${minMonth} - ₹${maxMonth}` : 'Price per Month';

  const cityDisplay = toTitleCase(currentCity);

  return (
    <div className="flex flex-nowrap lg:flex-col items-start gap-2.5 sm:gap-3 overflow-x-auto lg:overflow-visible pb-2 pt-1 w-full lg:items-stretch scrollbar-none">
      {/* Active city chip */}
      {currentCity && (
        <button
          type="button"
          onClick={clearCity}
          className="inline-flex min-h-[34px] shrink-0 items-center justify-between gap-1.5 rounded-full bg-brand-peridot/15 px-3.5 text-xs font-semibold text-body hover:bg-brand-peridot/25 border border-brand-peridot/30 transition-colors cursor-pointer w-auto lg:w-full whitespace-nowrap"
          aria-label={`Remove city filter ${cityDisplay}`}
        >
          <span>{cityDisplay}</span>
          <span aria-hidden="true" className="font-bold text-sm">×</span>
        </button>
      )}

      {/* Pure Veg Toggle */}
      <button 
        type="button"
        role="switch"
        aria-checked={currentVeg}
        onClick={() => applyFilters({ veg: currentVeg ? undefined : 'true' })}
        className="flex items-center justify-between gap-2.5 px-3.5 py-1 rounded-full border border-slate-200 bg-white min-h-[34px] shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)] w-auto lg:w-full cursor-pointer select-none hover:border-slate-300 transition-colors"
      >
        <span className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a] whitespace-nowrap">
          <Leaf size={14} className={currentVeg ? "text-[#6aa337] fill-[#6aa337]/10" : "text-slate-400"} />
          Pure Veg
        </span>
        <span
          className={cn(
            'relative inline-flex h-3 w-8 shrink-0 rounded-full items-center transition-colors duration-200 ease-in-out pointer-events-none',
            currentVeg ? 'bg-[#00A651]/75' : 'bg-slate-200',
            FOCUS_RING
          )}
        >
          <span
            className={cn(
              'pointer-events-none flex items-center justify-center h-[18px] w-[18px] rounded-md border-2 border-[#00A651] bg-white transition-transform duration-200 ease-in-out',
              currentVeg ? 'translate-x-[16px]' : '-translate-x-[2px]'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#00A651]" />
          </span>
        </span>
      </button>

      {/* Type of Meal Dropdown */}
      <FilterDropdown
        label="Type of Meal"
        activeLabel={mealLabel}
        isActive={isMealActive}
        activeColor="green"
        icon={<Soup size={14} />}
      >
        {(close) => (
          <div className="flex flex-col gap-2.5 min-w-[200px]">
            <div className="flex flex-col gap-2">
              {MEALS_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 hover:bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={meals.includes(opt.value)}
                    onChange={() => handleMealChange(opt.value)}
                    className="h-4 w-4 rounded border-slate-300 text-[#6aa337] focus:ring-[#6aa337] accent-[#6aa337] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
              <button
                type="button"
                onClick={() => {
                  setMeals([]);
                  applyFilters({ meals: undefined });
                  close();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  applyFilters();
                  close();
                }}
                className="bg-[#6aa337] text-white text-xs font-bold rounded-full px-4 py-2 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </FilterDropdown>

      {/* Operational Days Dropdown */}
      <FilterDropdown
        label="Operational Days"
        activeLabel={dayLabel}
        isActive={isDayActive}
        activeColor="green"
        activeLabelClassName="text-[10px] tracking-tight font-medium"
        icon={<CalendarDays size={14} />}
      >
        {(close) => (
          <div className="flex flex-col gap-2.5 min-w-[200px]">
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
              {DAYS_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 hover:bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={days.includes(opt.value)}
                    onChange={() => handleDayChange(opt.value)}
                    className="h-4 w-4 rounded border-slate-300 text-[#6aa337] focus:ring-[#6aa337] accent-[#6aa337] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
              <button
                type="button"
                onClick={() => {
                  setDays([]);
                  applyFilters({ days: undefined });
                  close();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  applyFilters();
                  close();
                }}
                className="bg-[#6aa337] text-white text-xs font-bold rounded-full px-4 py-2 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </FilterDropdown>

      {/* Container Type Dropdown */}
      <FilterDropdown
        label="Container Type"
        activeLabel={containerLabel}
        isActive={isContainerActive}
        activeColor="green"
        icon={<PaperBagIcon size={14} />}
      >
        {(close) => (
          <div className="flex flex-col gap-2.5 min-w-[200px]">
            <div className="flex flex-col gap-2">
              {CONTAINER_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 hover:bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={containers.includes(opt.value)}
                    onChange={() => handleContainerChange(opt.value)}
                    className="h-4 w-4 rounded border-slate-300 text-[#6aa337] focus:ring-[#6aa337] accent-[#6aa337] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
              <button
                type="button"
                onClick={() => {
                  setContainers([]);
                  applyFilters({ containers: undefined });
                  close();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  applyFilters();
                  close();
                }}
                className="bg-[#6aa337] text-white text-xs font-bold rounded-full px-4 py-2 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </FilterDropdown>

      {/* Spice Level Dropdown */}
      <FilterDropdown
        label="Spice Level"
        activeLabel={spiceLabel}
        isActive={isSpiceActive}
        activeColor="green"
        icon={<ChiliIcon size={14} />}
      >
        {(close) => (
          <div className="flex flex-col gap-2.5 min-w-[200px]">
            <div className="flex flex-col gap-2">
              {SPICE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 hover:bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={spices.includes(opt.value)}
                    onChange={() => handleSpiceChange(opt.value)}
                    className="h-4 w-4 rounded border-slate-300 text-[#6aa337] focus:ring-[#6aa337] accent-[#6aa337] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
              <button
                type="button"
                onClick={() => {
                  setSpices([]);
                  applyFilters({ spices: undefined });
                  close();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  applyFilters();
                  close();
                }}
                className="bg-[#6aa337] text-white text-xs font-bold rounded-full px-4 py-2 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </FilterDropdown>

      {/* Price per Meal Dropdown */}
      <FilterDropdown
        label="Price per Meal"
        activeLabel={mealPriceLabel}
        isActive={isMealPriceActive}
        activeColor="green"
        icon={<IndianRupee size={14} />}
      >
        {(close) => (
          <div className="flex flex-col gap-3 min-w-[240px]">
            <DualRangeSlider
              min={0}
              max={500}
              minVal={minMeal}
              maxVal={maxMeal}
              setMinVal={setMinMeal}
              setMaxVal={setMaxMeal}
              step={5}
            />
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
              <button
                type="button"
                onClick={() => {
                  setMinMeal(0);
                  setMaxMeal(500);
                  applyFilters({ minMealPrice: undefined, maxMealPrice: undefined });
                  close();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5 cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  applyFilters();
                  close();
                }}
                className="bg-[#6aa337] text-white text-xs font-bold rounded-full px-4 py-2 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </FilterDropdown>

      {/* Price per Month Dropdown */}
      <FilterDropdown
        label="Price per Month"
        activeLabel={monthPriceLabel}
        isActive={isMonthPriceActive}
        activeColor="green"
        icon={<ReceiptIndianRupee size={14} />}
      >
        {(close) => (
          <div className="flex flex-col gap-3 min-w-[240px]">
            <DualRangeSlider
              min={0}
              max={10000}
              minVal={minMonth}
              maxVal={maxMonth}
              setMinVal={setMinMonth}
              setMaxVal={setMaxMonth}
              step={100}
            />
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
              <button
                type="button"
                onClick={() => {
                  setMinMonth(0);
                  setMaxMonth(10000);
                  applyFilters({ minMonthPrice: undefined, maxMonthPrice: undefined });
                  close();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5 cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  applyFilters();
                  close();
                }}
                className="bg-[#6aa337] text-white text-xs font-bold rounded-full px-4 py-2 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </FilterDropdown>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className={cn(
            "text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-2 px-3 cursor-pointer shrink-0 inline-flex items-center gap-1.5 hover:underline w-auto lg:w-full justify-start self-center lg:self-start lg:mt-1 rounded-lg whitespace-nowrap",
            FOCUS_RING
          )}
        >
          <X size={14} className="text-slate-400" />
          Clear Filters
        </button>
      )}
    </div>
  );
}
