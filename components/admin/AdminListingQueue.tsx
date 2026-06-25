import { AdminListingRow, type AdminListingRowProps } from '@/components/admin/AdminListingRow';

interface AdminListingQueueProps {
  listings: AdminListingRowProps['listing'][];
  emptyMessage?: string;
}

export function AdminListingQueue({ listings, emptyMessage }: AdminListingQueueProps) {
  return (
    <table role="table" className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-gray-200">
          <th scope="col" className="px-3 py-2 text-sm font-semibold text-gray-600">
            ID
          </th>
          <th scope="col" className="px-3 py-2 text-sm font-semibold text-gray-600">
            Name
          </th>
          <th scope="col" className="px-3 py-2 text-sm font-semibold text-gray-600">
            City
          </th>
          <th scope="col" className="px-3 py-2 text-sm font-semibold text-gray-600">
            Submitted
          </th>
          <th scope="col" className="px-3 py-2 text-sm font-semibold text-gray-600">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {listings.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-3 py-12 text-center text-gray-500">
              {emptyMessage ?? 'No listings in the queue.'}
            </td>
          </tr>
        ) : (
          listings.map((listing) => <AdminListingRow key={listing.id} listing={listing} />)
        )}
      </tbody>
    </table>
  );
}
