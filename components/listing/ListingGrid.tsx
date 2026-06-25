import { ListingCard, type ListingCardProps } from '@/components/listing/ListingCard';

interface ListingGridProps {
  listings: ListingCardProps[];
  emptyMessage?: string;
}

export function ListingGrid({ listings, emptyMessage }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-300 px-4 py-12 text-center text-gray-500">
        {emptyMessage ?? 'No listings found.'}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {listings.map((props) => (
        <ListingCard key={props.listing.id} {...props} />
      ))}
    </div>
  );
}
