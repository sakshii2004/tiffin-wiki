'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { useTelemetry } from '@/components/providers/TelemetryProvider';
import { Search, MapPin } from 'lucide-react';
import { toTitleCase } from '@/lib/titleCase';

interface SearchBarProps {
  defaultCity?: string;
  defaultQ?: string;
  disableScaleOnFocus?: boolean;
}

export function SearchBar({ defaultCity = '', defaultQ = '', disableScaleOnFocus = false }: SearchBarProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { trackEvent } = useTelemetry();
  const [searchQuery, setSearchQuery] = useState<string>(defaultQ || toTitleCase(defaultCity) || '');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      showToast('Please type a location to search.', 'error');
      return;
    }
    trackEvent('SEARCH_EXECUTE', { searchQuery: trimmed, city: trimmed });
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form 
      action="/search"
      method="GET"
      onSubmit={handleSubmit} 
      className={`w-full bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#e2e8f0] flex items-center p-1 pl-3 sm:pl-3.5 gap-1.5 sm:gap-2 transition-all duration-300 ease-out focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.08)] focus-within:border-[#cbd5e1]${disableScaleOnFocus ? '' : ' focus-within:scale-[1.015]'}`}
    >
      <span className="text-[#94a3b8] shrink-0">
        <MapPin size={16} />
      </span>
      <input
        type="text"
        name="q"
        placeholder="Search area or city..."
        className="min-w-0 flex-1 border-none outline-none text-xs sm:text-sm text-[#0f172a] bg-transparent placeholder-[#94a3b8] focus:ring-0 p-0"
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
      />
      <div className="w-px h-5 sm:h-6 bg-[#e2e8f0] mx-0.5 shrink-0" />
      <button
        type="submit"
        aria-label="Find tiffins"
        className="bg-[#0f172a] text-white hover:bg-slate-800 transition-colors border-none rounded-full px-2.5 sm:px-4 py-1.5 font-medium text-xs md:text-sm flex items-center gap-1.5 cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-[#b85c38] focus:ring-offset-2"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Find Tiffins</span>
        <span className="sm:hidden text-[11px]">Search</span>
      </button>
    </form>
  );
}
