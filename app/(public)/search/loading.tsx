import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ListingCardSkeleton } from '@/components/listing/ListingCardSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SearchLoading() {
  return (
    <>
      <SiteHeader showSearchBar />
      <main id="main-content" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left sidebar: Filter bar skeleton */}
            <aside className="w-full lg:w-60 shrink-0 hidden lg:block border border-black/5 rounded-2xl p-4 bg-white shadow-(--shadow-soft) space-y-4">
              <Skeleton className="h-6 w-32 rounded-md" />
              <div className="space-y-3 pt-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </aside>

            {/* Right main content: Results skeleton */}
            <div className="flex-1 w-full flex flex-col gap-6">
              <Skeleton className="h-5 w-48 rounded-md" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
