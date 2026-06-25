import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

/**
 * Canonical App-Router loading UI for /search.
 *
 * Next.js automatically renders this during the server render of
 * `search/page.tsx` (which is `force-dynamic`), preventing a blank screen on
 * slow networks. CSS-only skeletons (Tailwind `animate-pulse`) — no client JS
 * spinner. Mirrors the search results layout (header + two-column card grid).
 */
export default function SearchLoading() {
  return (
    <>
      <SiteHeader showSearchBar />
      <main id="main-content" className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Heading + results-count placeholders */}
          <div className="mb-6 space-y-3">
            <div className="h-7 w-64 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Skeleton card grid — matches ListingGrid (md:grid-cols-2) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[var(--shadow-soft)]"
              >
                <div className="aspect-[16/9] w-full animate-pulse bg-gray-200" />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="flex gap-2">
                    <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                  </div>
                  <div className="mt-auto h-4 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
