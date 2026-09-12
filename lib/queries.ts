import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { getPublicUrl } from '@/lib/r2';
import type { ListingCardProps } from '@/components/listing/ListingCard';

/**
 * Single source of truth for the detail-page fetch. Because it is wrapped in
 * React cache(), calling it from both generateMetadata and the page body in the
 * same request runs the query only once — generateMetadata and the page
 * component are separate functions that do NOT share a Prisma fetch cache.
 */
export const getListingBySlug = cache(async (slug: string) => {
  return prisma.tiffinService.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      offerings: { orderBy: { sortOrder: 'asc' } },
      reviews: {
        where: { isVisible: true },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, image: true } },
          images: true,
        },
      },
      _count: { select: { reviews: { where: { isVisible: true } } } },
    },
  });
});

/** Average rating across a set of reviews, or null when there are none. */
export function computeAverageRating(reviews: { rating: number }[]): number | null {
  if (reviews.length === 0) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

/**
 * Shape returned by the list-page Prisma queries: a listing joined with its
 * cover image (take: 1) and a visible-review count.
 */
export interface ListingWithCover {
  id: string;
  slug: string;
  name: string;
  city: string;
  area: string | null;
  isVegetarian: boolean;
  hasNonVeg: boolean;
  mealsOffered: string[];
  offerings: {
    sizeName: string;
    mealComponents: string[];
    pricePerMeal: number | null;
    pricePerMonth: number | null;
    searchPricePerMeal: number | null;
    searchPricePerMonth: number | null;
  }[];
  images: { r2Key: string; altText: string | null }[];
  reviews: { rating: number }[];
  _count: { reviews: number };
}

/** Maps a Prisma listing (with cover image + review count) to ListingCard props. */
export function toListingCardProps(listing: ListingWithCover): ListingCardProps {
  const cover = listing.images[0];

  // Find cheapest pricePerMonth and pricePerMeal from offerings using computed search prices
  let cheapestMealPrice: number | null = null;
  let cheapestMonthPrice: number | null = null;
  let pricePerMealEstimated = false;
  let pricePerMonthEstimated = false;

  if (listing.offerings && listing.offerings.length > 0) {
    for (const offering of listing.offerings) {
      if (offering.searchPricePerMeal != null) {
        if (cheapestMealPrice === null || offering.searchPricePerMeal < cheapestMealPrice) {
          cheapestMealPrice = offering.searchPricePerMeal;
          pricePerMealEstimated = offering.pricePerMeal == null;
        }
      }
      if (offering.searchPricePerMonth != null) {
        if (cheapestMonthPrice === null || offering.searchPricePerMonth < cheapestMonthPrice) {
          cheapestMonthPrice = offering.searchPricePerMonth;
          pricePerMonthEstimated = offering.pricePerMonth == null;
        }
      }
    }
  }

  return {
    listing: {
      id: listing.id,
      slug: listing.slug,
      name: listing.name,
      city: listing.city,
      area: listing.area,
      isVegetarian: listing.isVegetarian,
      hasNonVeg: listing.hasNonVeg,
      mealsOffered: listing.mealsOffered,
      pricePerMonth: cheapestMonthPrice,
      pricePerMeal: cheapestMealPrice,
      pricePerMealEstimated,
      pricePerMonthEstimated,
    },
    coverImage: cover ? { publicUrl: getPublicUrl(cover.r2Key), altText: cover.altText } : null,
    reviewCount: listing._count.reviews,
    averageRating: computeAverageRating(listing.reviews) ?? undefined,
  };
}
