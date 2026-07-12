import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Info } from 'lucide-react';
import { MealBadge } from '@/components/ui/MealBadge';
import { VegIndicator } from '@/components/ui/VegIndicator';
import { StarRatingDisplay } from '@/components/ui/StarRatingDisplay';
import { toTitleCase } from '@/lib/titleCase';

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
    pricePerMealEstimated?: boolean;
    pricePerMonthEstimated?: boolean;
  };
  coverImage?: { publicUrl: string; altText?: string | null } | null;
  reviewCount?: number;
  averageRating?: number;
  /** Pre-resolved placeholder src (no-image cards only). Provided by ListingGrid. */
  placeholderSrc?: string;
  /** True for the first card — marks cover image as LCP-critical. */
  priority?: boolean;
}

function renderPrice(listing: ListingCardProps['listing']) {
  if (listing.pricePerMeal) {
    if (listing.pricePerMealEstimated) {
      return (
        <span
          className="flex items-center gap-1 text-base font-bold text-brand-peridot cursor-help select-none"
          title="Estimated based on the provider's monthly price and operational days."
        >
          ₹{listing.pricePerMeal}/meal
          <span className="text-xs font-medium text-gray-400">(est.)</span>
          <Info
            size={14}
            className="text-gray-400 inline-block shrink-0"
          />
        </span>
      );
    }
    return <span className="text-base font-bold text-brand-peridot">₹{listing.pricePerMeal}/meal</span>;
  }

  if (listing.pricePerMonth) {
    if (listing.pricePerMonthEstimated) {
      return (
        <span
          className="flex items-center gap-1 text-base font-bold text-brand-peridot cursor-help select-none"
          title="Estimated based on the provider's per-meal price and operational days."
        >
          ₹{listing.pricePerMonth}/mo
          <span className="text-xs font-medium text-gray-400">(est.)</span>
          <Info
            size={14}
            className="text-gray-400 inline-block shrink-0"
          />
        </span>
      );
    }
    return <span className="text-base font-bold text-brand-peridot">₹{listing.pricePerMonth}/mo</span>;
  }

  return null;
}

export function ListingCard({ listing, coverImage, reviewCount, averageRating, placeholderSrc, priority = false }: ListingCardProps) {
  const priceElement = renderPrice(listing);
  const location = listing.area ? `${toTitleCase(listing.area)}, ${toTitleCase(listing.city)}` : toTitleCase(listing.city);
  const meals = listing.mealsOffered.filter(
    (m): m is MealType => m === 'BREAKFAST' || m === 'LUNCH' || m === 'DINNER',
  );

  return (
    <Link
      href={`/tiffin/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-(--shadow-soft) transition-shadow hover:shadow-(--shadow-soft-lg) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-peridot focus-visible:ring-offset-2"
    >
      {/* Top section: Image (left) + Text & Badges (right) */}
      <div className="flex items-stretch gap-4 p-4">
        
        {/* Image - stretches to fill the height of the text content */}
        <div className="relative w-28 shrink-0 overflow-hidden rounded-xl border border-black/5 sm:w-32">
          {coverImage ? (
            <Image
              src={coverImage.publicUrl}
              alt={coverImage.altText ?? `Photo of ${listing.name}`}
              fill
              sizes="(max-width: 640px) 112px, 128px"
              className="object-cover"
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
            />
          ) : placeholderSrc ? (
            <Image
              src={placeholderSrc}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 640px) 112px, 128px"
              className="object-cover opacity-80"
            />
          ) : null}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
          {/* Increased service name size */}
          <h3 className="line-clamp-2 text-lg font-bold leading-tight text-body group-hover:text-brand-peridot">
            {listing.name}
          </h3>
          
          {/* Grouped Location + Badges with reduced vertical spacing */}
          <div className="mt-1.5 flex flex-col gap-1.5">
            {/* Increased place text size */}
            <p className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{location}</span>
            </p>
            
            {/* Better integrated badge layout */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <VegIndicator isVegetarian={listing.isVegetarian} hasNonVeg={listing.hasNonVeg} />
              {meals.map((meal) => (
                <MealBadge key={meal} type={meal} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: rating + price */}
      <div className="flex items-center justify-between gap-2 border-t border-black/5 bg-gray-50/30 px-4 py-3">
        {typeof averageRating === 'number' && reviewCount && reviewCount > 0 ? (
          <span className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-700">{averageRating.toFixed(1)}</span>
            <StarRatingDisplay rating={averageRating} size="md" color="terracotta" />
            <span className="text-sm text-gray-400">({reviewCount})</span>
          </span>
        ) : (
          <span className="text-sm text-gray-400">No reviews yet</span>
        )}
        {priceElement}
      </div>
    </Link>
  );
}