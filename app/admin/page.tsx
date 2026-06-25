import { prisma } from '@/lib/prisma';
import { AdminListingQueue } from '@/components/admin/AdminListingQueue';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab = (tabParam ?? 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED';

  // Stats row (Section 5.7)
  const [total, pending, approved, rejected, totalReviews] = await Promise.all([
    prisma.tiffinService.count(),
    prisma.tiffinService.count({ where: { status: 'PENDING' } }),
    prisma.tiffinService.count({ where: { status: 'APPROVED' } }),
    prisma.tiffinService.count({ where: { status: 'REJECTED' } }),
    prisma.review.count(),
  ]);

  // Listings for the selected tab — ordered by createdAt ASC for Pending (oldest first)
  const listings = await prisma.tiffinService.findMany({
    where: { status: tab },
    orderBy: { createdAt: tab === 'PENDING' ? 'asc' : 'desc' },
    select: { id: true, name: true, city: true, status: true, createdAt: true },
  });

  return (
    <div>
      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          { label: 'Total', value: total },
          { label: 'Pending', value: pending },
          { label: 'Approved', value: approved },
          { label: 'Rejected', value: rejected },
          { label: 'Reviews', value: totalReviews },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-black/5 bg-white p-4 text-center shadow-[var(--shadow-soft)]">
            <div className="text-2xl font-bold text-body">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 border-b">
        {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((t) => (
          <a
            key={t}
            href={`/admin?tab=${t}`}
            className={`px-4 py-2 text-sm font-medium capitalize transition ${
              tab === t
                ? 'border-b-2 border-brand-peridot text-body'
                : 'text-gray-500 hover:text-body'
            }`}
            aria-current={tab === t ? 'page' : undefined}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </a>
        ))}
      </div>

      {/* Listing table */}
      <AdminListingQueue
        listings={listings}
        emptyMessage={`No ${tab.toLowerCase()} listings.`}
      />
    </div>
  );
}
