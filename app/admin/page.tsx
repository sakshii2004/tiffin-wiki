import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AdminListingQueue } from '@/components/admin/AdminListingQueue';
import { AdminSearchInput } from '@/components/admin/AdminSearchInput';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { tab: tabParam, q: qParam } = await searchParams;
  const tab = (tabParam ?? 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED';
  const searchQuery = (qParam ?? '').trim();

  // Stats row
  const [total, pending, approved, rejected, totalReviews] = await Promise.all([
    prisma.tiffinService.count(),
    prisma.tiffinService.count({ where: { status: 'PENDING' } }),
    prisma.tiffinService.count({ where: { status: 'APPROVED' } }),
    prisma.tiffinService.count({ where: { status: 'REJECTED' } }),
    prisma.review.count(),
  ]);

  const where: Prisma.TiffinServiceWhereInput = {
    ...(tab ? { status: tab } : {}),
    ...(searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { city: { contains: searchQuery, mode: 'insensitive' } },
            { area: { contains: searchQuery, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const listings = await prisma.tiffinService.findMany({
    where,
    orderBy: { createdAt: tab === 'PENDING' ? 'asc' : 'desc' },
    select: { id: true, name: true, city: true, status: true, createdAt: true },
  });

  const emptyMsg = searchQuery
    ? `No ${tab.toLowerCase()} listings matching "${searchQuery}".`
    : `No ${tab.toLowerCase()} listings.`;

  return (
    <div className="space-y-6">
      {/* Header bar with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-body">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Manage tiffin service entries, review queue, edit, and delete.</p>
        </div>
        <AdminSearchInput initialSearch={searchQuery} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          { label: 'Total Listings', value: total },
          { label: 'Pending', value: pending },
          { label: 'Approved', value: approved },
          { label: 'Rejected', value: rejected },
          { label: 'Reviews', value: totalReviews },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-black/5 bg-white p-4 text-center shadow-[var(--shadow-soft)]">
            <div className="text-2xl font-bold text-body">{value}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-1 gap-2">
        <div className="flex gap-1">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((t) => {
            const params = new URLSearchParams();
            params.set('tab', t);
            if (searchQuery) params.set('q', searchQuery);
            return (
              <a
                key={t}
                href={`/admin?${params.toString()}`}
                className={`px-4 py-2 text-sm font-semibold capitalize transition ${
                  tab === t
                    ? 'border-b-2 border-brand-peridot text-body'
                    : 'text-gray-500 hover:text-body'
                }`}
                aria-current={tab === t ? 'page' : undefined}
              >
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </a>
            );
          })}
        </div>

        {searchQuery && (
          <span className="text-xs font-semibold text-brand-peridot bg-brand-peridot/10 px-3 py-1 rounded-full self-start sm:self-auto">
            Matching &quot;{searchQuery}&quot; ({listings.length} found)
          </span>
        )}
      </div>

      {/* Listing table */}
      <AdminListingQueue listings={listings} emptyMessage={emptyMsg} />
    </div>
  );
}
