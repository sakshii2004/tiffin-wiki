import Link from 'next/link';
import { FOCUS_RING } from '@/components/ui/styles';
import { toTitleCase } from '@/lib/titleCase';

export interface AdminListingRowProps {
  listing: {
    id: string;
    name: string;
    city: string;
    status: string;
    createdAt: Date;
  };
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}



export function AdminListingRow({ listing }: AdminListingRowProps) {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-3 py-2 font-mono text-sm text-gray-600">
        {listing.id.slice(0, 8)}…
      </td>
      <td className="px-3 py-2 text-sm font-medium text-body">{listing.name}</td>
      <td className="px-3 py-2 text-sm text-body">{toTitleCase(listing.city)}</td>
      <td className="px-3 py-2 text-sm text-gray-600">{formatDateTime(listing.createdAt)}</td>
      <td className="px-3 py-2">
        <Link
          href={`/admin/listings/${listing.id}`}
          className={`inline-flex min-h-[44px] items-center text-sm font-semibold text-body underline hover:no-underline ${FOCUS_RING}`}
        >
          Review →
        </Link>
      </td>
    </tr>
  );
}
