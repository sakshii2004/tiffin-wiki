import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getListingBySlug, computeAverageRating } from '@/lib/queries';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MealBadge } from '@/components/ui/MealBadge';
import { VegIndicator } from '@/components/ui/VegIndicator';
import { StarRatingDisplay } from '@/components/ui/StarRatingDisplay';
import { ShowNumberButton } from '@/components/ui/ShowNumberButton';
import { ReviewCard } from '@/components/listing/ReviewCard';
import { SearchParamToast } from '@/components/ui/SearchParamToast';
import { toTitleCase } from '@/lib/titleCase';
import { Info } from 'lucide-react';

export async function generateStaticParams() {
  const listings = await prisma.tiffinService.findMany({
    where: { status: 'APPROVED' },
    select: { slug: true },
  });
  return listings.map((l) => ({ slug: l.slug }));
}

export const dynamicParams = true; // ISR fallback for newly approved listings
export const revalidate = 300; // 5 minutes

interface DetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reviewed?: string; alreadyReviewed?: string }>;
}

const MEAL_VALUES = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
type MealType = (typeof MEAL_VALUES)[number];



/** Keep leading country code (+NN) and last 4 digits; mask the middle. */
function maskPhone(e164: string): string {
  const m = e164.match(/^(\+\d{1,3})(\d+)(\d{4})$/);
  if (!m) return e164;
  const [, cc, middle, last4] = m;
  return `${cc} ${'X'.repeat(middle.length)} ${last4}`;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  // Reuses the React cache()-wrapped fetch — no extra DB query.
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  const cityDisplay = toTitleCase(listing.city);
  const areaDisplay = listing.area ? `${toTitleCase(listing.area)}, ` : '';

  let cheapestMonthPrice: number | null = null;
  if (listing.offerings && listing.offerings.length > 0) {
    for (const offering of listing.offerings) {
      const monthPrice = offering.pricePerMonth ?? offering.searchPricePerMonth;
      if (monthPrice != null) {
        if (cheapestMonthPrice === null || monthPrice < cheapestMonthPrice) {
          cheapestMonthPrice = monthPrice;
        }
      }
    }
  }

  const priceText = cheapestMonthPrice ? ` ~₹${cheapestMonthPrice}/month.` : '';
  return {
    title: `${listing.name} — ${areaDisplay}${cityDisplay} — tiffin.wiki`,
    description: `${listing.name} offers ${listing.mealsOffered
      .join(', ')
      .toLowerCase()} tiffin in ${areaDisplay}${cityDisplay}.${priceText}`,
    openGraph: {
      title: `${listing.name} — tiffin.wiki`,
      url: `https://tiffin.wiki/tiffin/${slug}`,
    },
    alternates: { canonical: `https://tiffin.wiki/tiffin/${slug}` },
  };
}

export default async function TiffinDetailPage({ params, searchParams }: DetailPageProps) {
  const { slug } = await params;
  const { reviewed, alreadyReviewed } = await searchParams;
  const listing = await getListingBySlug(slug);

  if (!listing || listing.status !== 'APPROVED') {
    notFound();
  }

  const cityDisplay = toTitleCase(listing.city);
  const averageRating = computeAverageRating(listing.reviews);
  const reviewCount = listing._count.reviews;

  const meals = listing.mealsOffered.filter((m): m is MealType =>
    MEAL_VALUES.includes(m as MealType),
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.area ?? listing.city,
      addressRegion: listing.city,
      addressCountry: 'IN',
    },
    telephone: maskPhone(listing.whatsappNumber),
    ...(averageRating !== null
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: averageRating.toFixed(1),
            reviewCount,
            bestRating: '5',
            worstRating: '1',
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader showSearchBar defaultCity={listing.city} />
      {reviewed === '1' && (
        <SearchParamToast
          param={reviewed}
          message="Thank you! Your review has been posted."
          type="success"
        />
      )}
      {alreadyReviewed === '1' && (
        <SearchParamToast
          param={alreadyReviewed}
          message="You've already reviewed this listing."
          type="error"
        />
      )}
      <main id="main-content" className="flex-1">
        <div className="container mx-auto flex flex-col gap-8 px-4 py-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-body">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li>
                <Link href={`/search?city=${listing.city}`} className="hover:text-body">
                  {cityDisplay}
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li aria-current="page" className="text-body">
                {listing.name}
              </li>
            </ol>
          </nav>

          {/* Image gallery */}
          {listing.images.length > 0 ? (
            <div className="grid grid-flow-col auto-cols-[80%] grid-rows-1 gap-3 overflow-x-auto md:grid-flow-row md:auto-cols-auto md:grid-cols-3 md:overflow-visible">
              {listing.images.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100"
                >
                  <Image
                    src={image.publicUrl}
                    alt={image.altText ?? listing.name}
                    width={640}
                    height={480}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-brand-peridot/10 text-gray-500"
              aria-hidden="true"
            >
              No photos yet
            </div>
          )}

          {/* Title block */}
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold text-body">{listing.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {listing.area && <Badge variant="default">{toTitleCase(listing.area)}</Badge>}
              <Badge variant="brand">{cityDisplay}</Badge>
            </div>
            <p className="text-sm text-gray-500">Listed on tiffin.wiki</p>
          </div>

          {/* WhatsApp reveal */}
          <div className="w-full md:w-auto">
            <ShowNumberButton whatsappNumber={listing.whatsappNumber} />
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left column */}
            <dl className="flex flex-col gap-5">
              {meals.length > 0 && (
                <div>
                  <dt className="mb-2 text-sm font-semibold text-gray-500">Meals offered</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {meals.map((m) => (
                      <MealBadge key={m} type={m} />
                    ))}
                  </dd>
                </div>
              )}

              <div>
                <dt className="mb-2 text-sm font-semibold text-gray-500">Veg / Non-Veg</dt>
                <dd>
                  <VegIndicator
                    isVegetarian={listing.isVegetarian}
                    hasNonVeg={listing.hasNonVeg}
                  />
                </dd>
              </div>

              {listing.containerType && (
                <div>
                  <dt className="mb-2 text-sm font-semibold text-gray-500">Container type</dt>
                  <dd className="text-body">{toTitleCase(listing.containerType)}</dd>
                </div>
              )}

              {listing.requiresTiffinWash != null && (
                <div>
                  <dt className="mb-2 text-sm font-semibold text-gray-500">
                    Tiffin wash required
                  </dt>
                  <dd className="text-body">{listing.requiresTiffinWash ? 'Yes' : 'No'}</dd>
                </div>
              )}

              {listing.spiceLevel && (
                <div>
                  <dt className="mb-2 text-sm font-semibold text-gray-500">Spice level</dt>
                  <dd className="text-body">{toTitleCase(listing.spiceLevel)}</dd>
                </div>
              )}
            </dl>

            {/* Right column */}
            <dl className="flex flex-col gap-5">
              {listing.operationalDays.length > 0 && (
                <div>
                  <dt className="mb-2 text-sm font-semibold text-gray-500">Operational days</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {listing.operationalDays.map((d) => (
                      <Badge key={d} variant="default">
                        {toTitleCase(d)}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}

              {listing.deliveryAreas.length > 0 && (
                <div>
                  <dt className="mb-2 text-sm font-semibold text-gray-500">Delivery areas</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {listing.deliveryAreas.map((a) => (
                      <Badge key={a} variant="default">
                        {a}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}
            </dl>

            {/* Offerings Section */}
            {listing.offerings && listing.offerings.length > 0 && (() => {
              const daysPerWeek = listing.operationalDays.length > 0 ? listing.operationalDays.length : 6;
              const daysPerMonth = Math.round(daysPerWeek * 4.33);

              return (
                <div className="md:col-span-2">
                  <h3 className="mb-3 text-lg font-bold text-body">Offerings & Pricing</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {listing.offerings.map((offering) => (
                      <div
                        key={offering.id}
                        className="rounded-2xl border border-black/5 bg-white p-4 shadow-[var(--shadow-soft)] flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-slate-800 text-base">{offering.sizeName}</span>
                          <div className="text-right shrink-0 space-y-0.5">
                            {offering.pricePerMeal != null ? (
                              <div className="text-sm font-bold text-brand-peridot">
                                ₹{offering.pricePerMeal} <span className="text-xs text-gray-400 font-normal">/ meal</span>
                              </div>
                            ) : offering.searchPricePerMeal != null ? (
                              <div
                                className="text-sm font-bold text-slate-500 flex items-center justify-end gap-1 select-none"
                                title={`Estimated from ₹${offering.pricePerMonth}/month divided by ${daysPerMonth} operational days/month.`}
                              >
                                <span>~₹{offering.searchPricePerMeal}</span>
                                <span className="text-xs text-gray-400 font-normal">/ meal</span>
                                <span className="text-[10px] text-gray-400 font-medium">(est.)</span>
                                <Info size={13} className="text-gray-400 inline-block cursor-help shrink-0" />
                              </div>
                            ) : null}

                            {offering.pricePerMonth != null ? (
                              <div className="text-sm font-bold text-brand-peridot">
                                ₹{offering.pricePerMonth} <span className="text-xs text-gray-400 font-normal">/ month</span>
                              </div>
                            ) : offering.searchPricePerMonth != null ? (
                              <div
                                className="text-sm font-bold text-slate-500 flex items-center justify-end gap-1 select-none"
                                title={`Estimated from ₹${offering.pricePerMeal}/meal multiplied by ${daysPerMonth} operational days/month.`}
                              >
                                <span>~₹{offering.searchPricePerMonth}</span>
                                <span className="text-xs text-gray-400 font-normal">/ month</span>
                                <span className="text-[10px] text-gray-400 font-medium">(est.)</span>
                                <Info size={13} className="text-gray-400 inline-block cursor-help shrink-0" />
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {offering.mealComponents.length > 0 && (
                          <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-2.5">
                            {offering.mealComponents.map((comp) => (
                              <Badge key={comp} variant="default">
                                {toTitleCase(comp)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Description */}
          {listing.description && (
            <section aria-labelledby="about-heading" className="flex flex-col gap-2">
              <h2 id="about-heading" className="text-xl font-bold text-body">
                About
              </h2>
              <p className="whitespace-pre-line text-body">{listing.description}</p>
            </section>
          )}

          {/* Reviews */}
          <section aria-labelledby="reviews-heading" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 id="reviews-heading" className="text-xl font-bold text-body">
                  Reviews ({reviewCount})
                </h2>
                {averageRating !== null && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <StarRatingDisplay rating={averageRating} size="sm" />
                    <span>{averageRating.toFixed(1)}</span>
                  </span>
                )}
              </div>
              {/*
                Stage 4 handoff: plain link for now. Stage 6 replaces this with a
                server-checked variant that injects callbackUrl (this review page)
                into the sign-in redirect for unauthenticated users.
              */}
              <Button href={`/tiffin/${listing.slug}/review`} variant="secondary">
                Write a Review
              </Button>
            </div>

            {listing.reviews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {listing.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first to write one.</p>
            )}
          </section>

          {/* Add a listing nudge */}
          <section className="rounded-2xl border border-black/5 bg-white px-4 py-6 text-center shadow-[var(--shadow-soft)]">
            <p className="text-base font-medium text-body">
              Know another tiffin service? Help the community find it.
            </p>
            <div className="mt-4 flex justify-center">
              <Button href="/add" variant="primary">
                Add a tiffin
              </Button>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
