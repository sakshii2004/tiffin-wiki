import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { MealBadge } from '@/components/ui/MealBadge';
import { VegIndicator } from '@/components/ui/VegIndicator';
import { StarRatingDisplay } from '@/components/ui/StarRatingDisplay';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export interface ListingCardProps {
  listing: {
    id: string;
    slug: string;
    name: string;
    city: string;
    area?: string | null;
    isVegetarian: boolean;
    hasNonVeg: boolean;
    mealsOffered: string[];
    pricePerMonth?: number | null;
    pricePerMeal?: number | null;
  };
  coverImage?: { publicUrl: string; altText?: string | null } | null;
  reviewCount?: number;
  averageRating?: number;
}

function priceLabel(listing: ListingCardProps['listing']): string | null {
  if (listing.pricePerMonth) return `₹${listing.pricePerMonth}/month`;
  if (listing.pricePerMeal) return `₹${listing.pricePerMeal}/meal`;
  return null;
}

export function ListingCard({ listing, coverImage, reviewCount, averageRating }: ListingCardProps) {
  const price = priceLabel(listing);
  const location = listing.area ? `${listing.area}, ${listing.city}` : listing.city;
  const meals = listing.mealsOffered.filter(
    (m): m is MealType => m === 'BREAKFAST' || m === 'LUNCH' || m === 'DINNER',
  );

  return (
    <Link
      href={`/tiffin/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-soft-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-peridot focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        {coverImage ? (
          <Image
            src={coverImage.publicUrl}
            alt={coverImage.altText ?? `Photo of ${listing.name}`}
            width={640}
            height={360}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-brand-peridot/15 to-brand-peridot/5 text-gray-500"
            aria-hidden="true"
          >
            <span className="text-3xl">🍱</span>
            <span className="text-xs font-medium">No photo yet</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-body group-hover:text-brand-peridot">
          {listing.name}
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">{location}</Badge>
          <VegIndicator isVegetarian={listing.isVegetarian} hasNonVeg={listing.hasNonVeg} />
        </div>

        {meals.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {meals.map((meal) => (
              <MealBadge key={meal} type={meal} />
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {price && <span className="text-sm font-semibold text-body">{price}</span>}
          {typeof averageRating === 'number' && reviewCount && reviewCount > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <StarRatingDisplay rating={averageRating} size="sm" />
              <span>({reviewCount})</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
