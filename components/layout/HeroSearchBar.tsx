'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { useTelemetry } from '@/components/providers/TelemetryProvider';

// SVG Icons from reference
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const MapPinIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const NavigationIcon = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
);

export function HeroSearchBar() {
  const router = useRouter();
  const { showToast } = useToast();
  const { trackEvent } = useTelemetry();
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    <div className="w-full">
      {/* Search form */}
      <form 
        onSubmit={handleSubmit} 
        className="mx-auto w-full max-w-[680px] mb-5 bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#f1f5f9] flex items-center p-1.5 pl-5 gap-2 md:gap-3 transition-all duration-300 ease-out focus-within:scale-[1.015] focus-within:shadow-[0_8px_32px_rgba(0,0,0,0.12)] focus-within:border-[#e2e8f0]"
      >
        <span className="text-[#94a3b8] shrink-0">
          <MapPinIcon size={22} />
        </span>
        <input
          type="text"
          placeholder="Where do you need food? (e.g. Kothrud)"
          className="flex-1 border-none outline-none text-base text-[#0f172a] bg-transparent placeholder-[#94a3b8] focus:ring-0"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
        <div className="w-px h-7 bg-[#e2e8f0] mx-1 shrink-0" />
        <button
          type="submit"
          className="bg-[#0f172a] text-white hover:bg-slate-800 transition-colors border-none rounded-full px-5.5 py-2.5 font-medium text-sm md:text-base flex items-center gap-2 cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-[#b85c38] focus:ring-offset-2"
        >
          <SearchIcon />
          <span>Find Tiffins</span>
        </button>
      </form>

      {/* Value Proposition Badges */}
      <div className="flex flex-wrap justify-center gap-2.5 text-[13px] text-[#64748b]">
        <span
          className="inline-flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-[#e2e8f0] shadow-[0_1px_4px_rgba(0,0,0,0.05)] cursor-default select-none font-medium text-[#64748b]"
        >
          <NavigationIcon size={14} />
          <span>Home-Cooked Tiffins</span>
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#eef5e6] text-[#2d5c10] border border-[#b6d98a] rounded-full font-semibold cursor-default select-none"
        >
          Pure Veg & Regional Meals
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe] rounded-full font-semibold cursor-default select-none"
        >
          Direct Provider Contact
        </span>
      </div>
    </div>
  );
}
