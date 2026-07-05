import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { SearchBar } from '@/components/layout/SearchBar';
import { NavAuthSection } from '@/components/layout/NavAuthSection';

interface SiteHeaderProps {
  /** When true, renders the inline <SearchBar> (used on search & detail pages). */
  showSearchBar?: boolean;
  /** Pre-fills the inline SearchBar's city select (only when showSearchBar). */
  defaultCity?: string;
  /** Pre-fills the inline SearchBar's keyword input (only when showSearchBar). */
  defaultQ?: string;
}

/**
 * SiteHeader is a Server Component. It imports the Client `SearchBar` and
 * renders it as a child — a Server Component may render Client Components, so
 * the header itself must NOT carry `'use client'` (that would needlessly ship
 * the header to the client bundle).
 */
export function SiteHeader({ showSearchBar = false, defaultCity, defaultQ }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 bg-transparent pointer-events-none">
      <div className="mx-auto max-w-[1152px] w-full bg-white/95 backdrop-blur-[10px] rounded-[28px] md:rounded-full border border-slate-200/50 shadow-[0_0_15px_rgba(0,0,0,0.05)] px-6 py-2 md:py-2.5 flex flex-col md:flex-row md:items-center justify-between min-h-[56px] pointer-events-auto">
        <div className="flex items-center justify-between w-full md:w-auto h-10 md:h-11">
          {/* Logo / wordmark */}
          <Link
            href="/"
            className="flex items-center cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b85c38]"
            aria-label="Tiffin Wiki — home"
          >
            <Image
              src="/tiffin-wiki-logo.png"
              alt="Tiffin Wiki Logo"
              width={160}
              height={40}
              priority
              className="h-8 md:h-9 w-auto object-contain"
            />
          </Link>

          {/* On Mobile: Action buttons shown on the right side of the header */}
          <div className="flex items-center gap-4 md:hidden">
            <NavAuthSection />
            <Link
              href="/add"
              className="bg-[#b85c38] text-white rounded-full px-4 py-2 font-medium text-[14px] flex items-center gap-1.5 hover:opacity-90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b85c38]"
            >
              <Plus size={18} />
              <span className="sr-only sm:not-sr-only">Add a Tiffin</span>
            </Link>
          </div>
        </div>

        {/* Optional inline search — centered on desktop, stacked on mobile */}
        {showSearchBar && (
          <div className="w-full md:max-w-md md:flex-1 md:mx-6 pb-2 md:pb-0">
            <SearchBar defaultCity={defaultCity} defaultQ={defaultQ} />
          </div>
        )}

        {/* On Desktop: Action buttons */}
        <div className="hidden md:flex items-center gap-4">
          <NavAuthSection />
          <Link
            href="/add"
            className="bg-[#b85c38] text-white rounded-full px-[18px] py-2 font-medium text-[14px] flex items-center gap-1.5 hover:opacity-90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b85c38]"
          >
            <Plus size={18} />
            <span>Add a Tiffin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
