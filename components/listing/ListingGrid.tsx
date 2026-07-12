import { ListingCard, type ListingCardProps } from '@/components/listing/ListingCard';

interface ListingGridProps {
  listings: ListingCardProps[];
  emptyMessage?: string;
}

const PLACEHOLDER_COUNT = 6;

/** Stable pseudo-random base index (1–6) from listing id. */
function baseIndex(id: string): number {
  const sum = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (sum % PLACEHOLDER_COUNT) + 1;
}

/**
 * Resolves a placeholder src for each listing, ensuring no two consecutive
 * no-image cards share the same placeholder.
 */
function resolvePlaceholders(listings: ListingCardProps[]): (string | null)[] {
  let prevIdx: number | null = null;
  return listings.map((item) => {
    if (item.coverImage) {
      prevIdx = null;
      return null;
    }
    let idx = baseIndex(item.listing.id);
    if (idx === prevIdx) {
      idx = (idx % PLACEHOLDER_COUNT) + 1;
    }
    prevIdx = idx;
    return `/placeholder-images/${idx}.png`;
  });
}

export function ListingGrid({ listings, emptyMessage }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-300 px-4 py-12 text-center text-gray-500">
        {emptyMessage ?? 'No listings found.'}
      </p>
    );
  }

  const placeholders = resolvePlaceholders(listings);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {listings.map((props, i) => (
        <ListingCard
          key={props.listing.id}
          {...props}
          placeholderSrc={placeholders[i] ?? undefined}
          priority={i === 0}
        />
      ))}
    </div>
  );
}
