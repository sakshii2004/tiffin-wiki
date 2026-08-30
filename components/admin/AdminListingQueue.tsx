import { AdminListingRow, type AdminListingRowProps } from '@/components/admin/AdminListingRow';

interface AdminListingQueueProps {
  listings: AdminListingRowProps['listing'][];
  emptyMessage?: string;
}

export function AdminListingQueue({ listings, emptyMessage }: AdminListingQueueProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-emerald-500/20 bg-slate-900/80 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.4)]">
      <table role="table" className="w-full border-collapse text-left font-mono">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/60">
            <th scope="col" className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              ID
            </th>
            <th scope="col" className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Name
            </th>
            <th scope="col" className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              City
            </th>
            <th scope="col" className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Status
            </th>
            <th scope="col" className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Submitted
            </th>
            <th scope="col" className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-400 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {listings.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-16 text-center text-slate-500 font-medium">
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
