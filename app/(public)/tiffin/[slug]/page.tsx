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
import { PhotosCarousel } from '@/components/listing/PhotosCarousel';
import { SearchParamToast } from '@/components/ui/SearchParamToast';
import { toTitleCase } from '@/lib/titleCase';
import { Info, MapPin } from 'lucide-react';

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
  const pageTitle = `${listing.name} — ${areaDisplay}${cityDisplay} — tiffin.wiki`;
  const pageDescription = `${listing.name} offers ${listing.mealsOffered
    .join(', ')
    .toLowerCase()} tiffin in ${areaDisplay}${cityDisplay}.${priceText}`;
  const canonicalUrl = `https://tiffin.wiki/tiffin/${slug}`;
  const coverImage = listing.images?.[0]?.publicUrl;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      type: 'article',
      images: coverImage
        ? [
            {
              url: coverImage,
              width: 1200,
              height: 630,
              alt: `${listing.name} tiffin service in ${cityDisplay}`,
            },
          ]
        : [
            {
              url: '/tiffin-wiki-logo.png',
              width: 1200,
              height: 630,
              alt: 'tiffin.wiki',
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: coverImage ? [coverImage] : ['/tiffin-wiki-logo.png'],
    },
    alternates: { canonical: canonicalUrl },
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    url: `https://tiffin.wiki/tiffin/${slug}`,
    image: listing.images.map((img) => img.publicUrl),
    servesCuisine: 'Indian',
    currenciesAccepted: 'INR',
    priceRange: cheapestMonthPrice ? `₹${cheapestMonthPrice}/month` : '₹₹',
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
        {/* 
          Container width updated to max-w-7xl to match standard navbar widths
          and provide ample room for the 6-column split.
        */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-sm font-medium text-slate-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-body transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li>
                <Link href={`/search?city=${encodeURIComponent(listing.city)}`} className="hover:text-body transition-colors">
                  {cityDisplay}
                </Link>
              </li>
              {listing.area && (
                <>
                  <li aria-hidden="true" className="text-slate-300">/</li>
                  <li>
                    <Link
                      href={`/search?city=${encodeURIComponent(listing.city)}&q=${encodeURIComponent(listing.area)}`}
                      className="hover:text-body transition-colors"
                    >
                      {toTitleCase(listing.area)}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li aria-current="page" className="text-body">
                {listing.name}
              </li>
            </ol>
          </nav>

          {/* MAIN 6-COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 items-start">

            {/* LEFT COLUMN: 4/6 (Hero, Photos, About, Reviews) */}
            <div className="lg:col-span-4 flex flex-col gap-8">

              {/* 1. HERO SECTION */}
              <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
                {/* Subtle Brand Top Accent */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-peridot" />

                {/* Title Row: Display Name + VegIndicator + StarRatingDisplay */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-body">
                        {listing.name}
                      </h1>
                      <div className="shrink-0 flex items-center gap-2 mt-1 sm:mt-0">
                        <VegIndicator isVegetarian={listing.isVegetarian} hasNonVeg={listing.hasNonVeg} />
                        {averageRating !== null && (
                          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3 ml-1">
                            <StarRatingDisplay rating={averageRating} size="sm" />
                            <span className="font-bold text-slate-800 text-sm">{averageRating.toFixed(1)}</span>
                            <span className="text-slate-400 text-xs font-medium">({reviewCount})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location Row */}
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                      <MapPin size={16} className="text-brand-peridot shrink-0" />
                      <span>
                        {listing.area ? `${toTitleCase(listing.area)}, ` : ''}
                        {cityDisplay}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Qualifier (Most Critical) */}
                {listing.deliveryAreas.length > 0 && (
                  <div className="inline-flex flex-wrap items-center gap-2 rounded-xl bg-brand-peridot/10 border border-brand-peridot/20 px-3 py-2.5 text-sm self-start">
                    <span className="font-bold text-brand-peridot shrink-0">Delivers to:</span>
                    <span className="text-slate-700 font-medium leading-tight">{listing.deliveryAreas.join(', ')}</span>
                  </div>
                )}

                {/* Schedule Row */}
                {(meals.length > 0 || listing.operationalDays.length > 0) && (
                  <div className="flex flex-wrap items-center gap-4 text-sm bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    {meals.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Meals</span>
                        {meals.map((m) => (
                          <MealBadge key={m} type={m} />
                        ))}
                      </div>
                    )}
                    {meals.length > 0 && listing.operationalDays.length > 0 && (
                      <div className="hidden sm:block w-px h-5 bg-slate-200" />
                    )}
                    {listing.operationalDays.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Days</span>
                        <div className="flex flex-wrap gap-1">
                          {listing.operationalDays.map((d) => (
                            <Badge key={d} variant="secondary" className="text-xs px-2.5 py-0.5">
                              {toTitleCase(d)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* High-Visibility CTA Box */}
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-brand-peridot/5 to-transparent p-5 border border-brand-peridot/20">
                  <div className="flex flex-col gap-1">
                    <p className="text-base font-bold text-slate-800">Ready to order?</p>
                    <p className="text-sm text-slate-500 font-medium">Reach out to the provider directly on WhatsApp.</p>
                  </div>
                  <div className="shrink-0 w-full sm:w-auto">
                    <ShowNumberButton whatsappNumber={listing.whatsappNumber} />
                  </div>
                </div>
              </section>

              {/* About the Service Card */}
              {(listing.description || listing.containerType || listing.spiceLevel || listing.requiresTiffinWash != null) && (
                <section aria-labelledby="about-heading" className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm flex flex-col gap-5">
                  <h2 id="about-heading" className="text-lg font-bold text-body">
                    Service Details
                  </h2>

                  {listing.description && (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                      {listing.description}
                    </p>
                  )}

                  {(listing.containerType || listing.spiceLevel || listing.requiresTiffinWash != null) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-slate-100/80 pt-5 mt-2">
                      {listing.containerType && (
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="text-slate-500 font-medium">Container Type</span>
                          <span className="font-bold text-slate-800">{toTitleCase(listing.containerType)}</span>
                        </div>
                      )}
                      {listing.requiresTiffinWash != null && (
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="text-slate-500 font-medium">Tiffin Wash Required</span>
                          <span className="font-bold text-slate-800">{listing.requiresTiffinWash ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      {listing.spiceLevel && (
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="text-slate-500 font-medium">Spice Level</span>
                          <span className="font-bold text-slate-800">{toTitleCase(listing.spiceLevel)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Reviews Section */}
              <section aria-labelledby="reviews-heading" className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h2 id="reviews-heading" className="text-2xl font-bold text-body">
                      Reviews <span className="text-slate-400 font-medium text-lg ml-1">({reviewCount})</span>
                    </h2>
                  </div>
                  <Button href={`/tiffin/${listing.slug}/review`} variant="secondary" className="shadow-sm border-slate-200">
                    Write a Review
                  </Button>
                </div>

                {/* Reviews Breakdown Block */}
                {reviewCount > 0 && averageRating !== null && (() => {
                  const ratingsCount = [0, 0, 0, 0, 0];
                  listing.reviews.forEach((r) => {
                    const idx = Math.min(Math.max(Math.round(r.rating) - 1, 0), 4);
                    ratingsCount[idx]++;
                  });

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                      <div className="flex flex-col items-center text-center justify-center sm:border-r sm:border-slate-100 py-2">
                        <span className="text-6xl font-black tracking-tighter text-slate-800">{averageRating.toFixed(1)}</span>
                        <div className="mt-3 flex items-center justify-center">
                          <StarRatingDisplay rating={averageRating} size="lg" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-widest">Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
                      </div>

                      <div className="sm:col-span-2 flex flex-col gap-2.5 sm:px-6">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = ratingsCount[stars - 1];
                          const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                          return (
                            <div key={stars} className="flex items-center gap-4 text-sm">
                              <span className="w-10 text-slate-700 font-bold shrink-0 flex items-center justify-end gap-1.5">
                                {stars} <span className="text-amber-400 text-base leading-none">★</span>
                              </span>
                              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-brand-peridot rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-8 text-right text-xs font-semibold text-slate-500 shrink-0">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {listing.reviews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5">
                    {listing.reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-amber-400 text-xl">
                      ★
                    </div>
                    <p className="text-slate-500 font-medium">No reviews yet. Be the first to share your experience!</p>
                  </div>
                )}
              </section>

              {/* Add a listing nudge */}
              <section className="rounded-2xl border border-brand-peridot/20 bg-gradient-to-br from-brand-peridot/10 to-transparent px-6 py-10 text-center flex flex-col items-center gap-5 mt-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-slate-800">
                    Know another great tiffin service?
                  </h3>
                  <p className="text-sm text-slate-600">
                    Help the community grow by adding them to our directory.
                  </p>
                </div>
                <Button href="/add" variant="primary" className="shadow-md hover:shadow-lg transition-shadow">
                  Add a tiffin service
                </Button>
              </section>
            </div>

            {/* RIGHT COLUMN: 2/6 (Offerings & Pricing) */}
            <div className="lg:col-span-2 relative">
              {/* Sticky wrapper restricting height so the inner container can scroll */}
              <div className="sticky top-24 flex flex-col gap-6 max-h-[calc(100vh-7rem)]">

                <PhotosCarousel images={listing.images} listingName={listing.name} />

                <div className="flex items-center gap-2 shrink-0">
                  <h2 className="text-xl font-bold text-body">Offerings & Pricing</h2>
                </div>

                {listing.offerings && listing.offerings.length > 0 ? (
                  /* Scrollable container for offerings */
                  <div className="flex flex-col gap-4 overflow-y-auto pr-1 pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {(() => {
                      const daysPerWeek = listing.operationalDays.length > 0 ? listing.operationalDays.length : 6;
                      const daysPerMonth = Math.round(daysPerWeek * 4.33);

                      return listing.offerings.map((offering) => (
                        <div
                          key={offering.id}
                          className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 pb-6 shadow-sm hover:shadow-md hover:border-brand-peridot/40 transition-all duration-300 flex flex-col gap-3 shrink-0"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-brand-peridot/0 group-hover:bg-brand-peridot/80 transition-colors duration-300" />

                          <div className="flex flex-col gap-2.5">
                            <span className="font-extrabold text-body text-base leading-tight">{offering.sizeName}</span>

                            <div className="flex flex-col gap-1 border-l-2 border-slate-100 pl-2.5">
                              {offering.pricePerMeal != null ? (
                                <div className="text-sm font-bold text-slate-800 flex items-baseline gap-1">
                                  ₹{offering.pricePerMeal} <span className="text-[11px] text-slate-500 font-medium">/ meal</span>
                                </div>
                              ) : offering.searchPricePerMeal != null ? (
                                <div
                                  className="text-sm font-bold text-slate-500 flex items-center gap-1.5 select-none cursor-help"
                                  title={`Estimated from ₹${offering.pricePerMonth}/month divided by ${daysPerMonth} operational days/month.`}
                                >
                                  <span>~₹{offering.searchPricePerMeal}</span>
                                  <span className="text-[11px] text-slate-400 font-medium">/ meal</span>
                                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-bold uppercase tracking-wider">Est.</span>
                                </div>
                              ) : null}

                              {offering.pricePerMonth != null ? (
                                <div className="text-sm font-bold text-slate-800 flex items-baseline gap-1">
                                  ₹{offering.pricePerMonth} <span className="text-[11px] text-slate-500 font-medium">/ month</span>
                                </div>
                              ) : offering.searchPricePerMonth != null ? (
                                <div
                                  className="text-sm font-bold text-slate-500 flex items-center gap-1.5 select-none cursor-help"
                                  title={`Estimated from ₹${offering.pricePerMeal}/meal multiplied by ${daysPerMonth} operational days/month.`}
                                >
                                  <span>~₹{offering.searchPricePerMonth}</span>
                                  <span className="text-[11px] text-slate-400 font-medium">/ month</span>
                                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-bold uppercase tracking-wider">Est.</span>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {offering.mealComponents.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                              {offering.mealComponents.map((comp) => (
                                <Badge key={comp} variant="brand" className="text-[10px] px-2 py-0.5 hover:bg-brand-peridot/20 transition-colors font-medium">
                                  {toTitleCase(comp)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-slate-500 text-sm">
                    No offerings listed.
                  </div>
                )}

                {/* Brand color dark blue thin block or border where the container ends */}
                <div className="h-[3px] bg-[#0f172a] rounded-full w-full shrink-0 -mt-4" />
              </div>
            </div>

          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
