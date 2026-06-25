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

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

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
  const cityDisplay = titleCase(listing.city);
  const areaDisplay = listing.area ? `${listing.area}, ` : '';
  const priceText = listing.pricePerMonth ? ` ~₹${listing.pricePerMonth}/month.` : '';
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

  const cityDisplay = titleCase(listing.city);
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
              {listing.area && <Badge variant="default">{listing.area}</Badge>}
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

              {listing.mealSizes.length > 0 && (
                <div>
                  <dt className="mb-2 text-sm font-semibold text-gray-500">Meal sizes</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {listing.mealSizes.map((s) => (
                      <Badge key={s} variant="default">
                        {titleCase(s)}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}

              {listing.mealComponents.length > 0 && (
                <div>
                  <dt className="mb-2 text-sm font-semibold text-gray-500">Meal components</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {listing.mealComponents.map((c) => (
                      <Badge key={c} variant="default">
                        {titleCase(c)}
                      </Badge>
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
                  <dd className="text-body">{titleCase(listing.containerType)}</dd>
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
                  <dd className="text-body">{titleCase(listing.spiceLevel)}</dd>
                </div>
              )}
            </dl>

            {/* Right column */}
            <dl className="flex flex-col gap-5">
              {(listing.pricePerMeal || listing.pricePerMonth) && (
                <div>
                  <dt className="mb-2 text-sm font-semibold text-gray-500">Price</dt>
                  <dd className="flex flex-col gap-0.5 text-body">
                    {listing.pricePerMeal && <span>₹{listing.pricePerMeal} / meal</span>}
                    {listing.pricePerMonth && <span>₹{listing.pricePerMonth} / month</span>}
                  </dd>
                </div>
              )}

              {listing.operationalDays.length > 0 && (
                <div>
                  <dt className="mb-2 text-sm font-semibold text-gray-500">Operational days</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {listing.operationalDays.map((d) => (
                      <Badge key={d} variant="default">
                        {titleCase(d)}
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
