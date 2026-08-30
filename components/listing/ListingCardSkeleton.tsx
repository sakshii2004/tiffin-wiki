import { Skeleton } from '@/components/ui/Skeleton';

export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-(--shadow-soft)">
      {/* Top section: Image (left) + Text & Badges (right) */}
      <div className="flex items-stretch gap-4 p-4">
        {/* Thumbnail Image Skeleton */}
        <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-black/5 sm:h-28 sm:w-32">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>

        {/* Content Skeleton */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-1">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
        </div>
      </div>

      {/* Bottom section: rating + price */}
      <div className="flex items-center justify-between gap-2 border-t border-black/5 bg-gray-50/30 px-4 py-3">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>
    </div>
  );
}
