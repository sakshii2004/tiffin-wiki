'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';
import { FIELD_BASE, FOCUS_RING_OFFSET } from '@/components/ui/styles';
import { Select } from '@/components/ui/Select';

const CITIES = [
  { label: 'Mumbai', value: 'mumbai' },
  { label: 'Delhi', value: 'delhi' },
  { label: 'Bangalore', value: 'bangalore' },
  { label: 'Hyderabad', value: 'hyderabad' },
  { label: 'Pune', value: 'pune' },
  { label: 'Chennai', value: 'chennai' },
  { label: 'Ahmedabad', value: 'ahmedabad' },
  { label: 'Kolkata', value: 'kolkata' },
  { label: 'Other', value: 'other' },
] as const;

interface SearchBarProps {
  defaultCity?: string;
  defaultQ?: string;
}

export function SearchBar({ defaultCity = 'mumbai', defaultQ = '' }: SearchBarProps) {
  const router = useRouter();
  const [city, setCity] = useState(defaultCity);
  const [q, setQ] = useState(defaultQ);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    const trimmed = q.trim();
    if (trimmed) params.set('q', trimmed);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-end"
      role="search"
    >
      <Select
        id="search-city"
        label="City"
        name="city"
        options={CITIES}
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="search-q" className="text-sm font-medium text-body">
          Search
        </label>
        <input
          id="search-q"
          name="q"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Service name, area..."
          className={cn(FIELD_BASE, 'border-gray-300')}
        />
      </div>

      <button
        type="submit"
        className={cn(
          'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-brand-peridot px-6 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-all hover:opacity-90 hover:shadow-[var(--shadow-soft-lg)]',
          FOCUS_RING_OFFSET,
        )}
      >
        Find Tiffin
      </button>
    </form>
  );
}
