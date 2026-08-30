import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Skeleton } from '@/components/ui/Skeleton';

export default function TiffinDetailLoading() {
  return (
    <>
      <SiteHeader showSearchBar />
      <main id="main-content" className="flex-1 bg-[#fffdf7]">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Header block skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-8 w-72 rounded-lg" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>

          {/* Gallery carousel skeleton */}
          <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden border border-black/5 bg-white shadow-(--shadow-soft)">
            <Skeleton className="h-full w-full rounded-2xl" />
          </div>

          {/* Grid section: Info & Offerings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-(--shadow-soft) space-y-4">
                <Skeleton className="h-6 w-36 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>

              {/* Offerings skeleton */}
              <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-(--shadow-soft) space-y-4">
                <Skeleton className="h-6 w-44 rounded-md" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                </div>
              </div>
            </div>

            {/* Sidebar action card skeleton */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-(--shadow-soft) space-y-4">
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-4 w-48 mx-auto rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
