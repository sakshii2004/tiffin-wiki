import Link from "next/link";
import { SearchBar } from "@/components/layout/SearchBar";

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
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="container mx-auto flex flex-col gap-3 rounded-full border border-black/5 bg-white/90 px-4 py-3 shadow-[var(--shadow-soft-lg)] backdrop-blur-md md:flex-row md:items-center md:justify-between md:gap-6 md:py-2 md:pl-6 md:pr-3">
        {/* Logo / wordmark */}
        <Link
          href="/"
          className="text-2xl font-bold text-brand-peridot hover:opacity-90 transition-opacity"
          aria-label="Tiffin Wiki — home"
        >
          Tiffin Wiki
        </Link>

        {/* Optional inline search — centred on desktop, stacked on mobile */}
        {showSearchBar && (
          <div className="w-full md:max-w-xl md:flex-1">
            <SearchBar defaultCity={defaultCity} defaultQ={defaultQ} />
          </div>
        )}

        {/* Primary action */}
        <nav aria-label="Primary navigation">
          <Link
            href="/add"
            className="
              inline-flex items-center justify-center
              min-h-[44px] min-w-[44px]
              rounded-full px-5 py-2
              bg-brand-peridot text-white
              text-sm font-semibold
              shadow-[var(--shadow-soft)]
              hover:opacity-90 hover:shadow-[var(--shadow-soft-lg)] transition-all
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-peridot
            "
          >
            Add a Tiffin
          </Link>
        </nav>
      </div>
    </header>
  );
}
