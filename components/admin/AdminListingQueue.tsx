import { AdminListingRow, type AdminListingRowProps } from '@/components/admin/AdminListingRow';

interface AdminListingQueueProps {
  listings: AdminListingRowProps['listing'][];
  emptyMessage?: string;
}

export function AdminListingQueue({ listings, emptyMessage }: AdminListingQueueProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-[var(--shadow-soft)]">
      <table role="table" className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-200 bg-slate-50/50">
            <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              ID
            </th>
            <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Name
            </th>
            <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              City
            </th>
            <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Status
            </th>
            <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Submitted
            </th>
            <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {listings.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-16 text-center text-slate-500 font-medium">
                {emptyMessage ?? 'No listings in the queue.'}
              </td>
            </tr>
          ) : (
            listings.map((listing) => <AdminListingRow key={listing.id} listing={listing} />)
          )}
        </tbody>
      </table>
    </div>
  );
}
