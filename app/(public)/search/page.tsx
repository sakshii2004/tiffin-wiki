import type { Metadata } from 'next';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { toListingCardProps } from '@/lib/queries';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { FilterBar } from '@/components/layout/FilterBar';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { toTitleCase } from '@/lib/titleCase';

// Fully dynamic — query-driven, no ISR.
export const dynamic = 'force-dynamic';

type RawSearchParams = {
  city?: string;
  q?: string;
  veg?: string;
  meals?: string;
  days?: string;
  containers?: string;
  spices?: string;
  minMealPrice?: string;
  maxMealPrice?: string;
  minMonthPrice?: string;
  maxMonthPrice?: string;
  page?: string;
};

interface SearchPageProps {
  searchParams: Promise<RawSearchParams>;
}

const PAGE_SIZE = 20;



export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { city = '', q = '' } = await searchParams;
  const display = city ? toTitleCase(city) : (q ? `"${q}"` : 'India');
  const alternatesUrl = new URLSearchParams();
  if (city) alternatesUrl.set('city', city);
  if (q) alternatesUrl.set('q', q);
  const qs = alternatesUrl.toString();
  return {
    title: `Tiffin services in ${display} — tiffin.wiki`,
    description: `Browse verified tiffin meal services in ${display}. Community-listed, manually verified.`,
    robots: { index: true, follow: true },
    alternates: { canonical: `https://tiffin.wiki/search${qs ? '?' + qs : ''}` },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const city = (params.city ?? '').trim().toLowerCase();
  const q = (params.q ?? '').trim();
  const vegOnly = params.veg === 'true';

  // Parse comma-separated array params
  const meals = params.meals ? params.meals.split(',').filter(Boolean) : [];
  const days = params.days ? params.days.split(',').filter(Boolean) : [];
  const containers = params.containers ? params.containers.split(',').filter(Boolean) : [];
  const spices = params.spices ? params.spices.split(',').filter(Boolean) : [];

  // Parse price ranges
  const minMealPrice = params.minMealPrice ? parseInt(params.minMealPrice, 10) : undefined;
  const maxMealPrice = params.maxMealPrice ? parseInt(params.maxMealPrice, 10) : undefined;
  const minMonthPrice = params.minMonthPrice ? parseInt(params.minMonthPrice, 10) : undefined;
  const maxMonthPrice = params.maxMonthPrice ? parseInt(params.maxMonthPrice, 10) : undefined;

  // If neither city nor query is provided, render the search form.
  if (!city && !q) {
    return (
      <>
        <SiteHeader showSearchBar />
        <main id="main-content" className="flex-1">
          <div className="container mx-auto px-4 py-24 text-center">
            <h1 className="text-2xl font-bold text-body">Search tiffin services</h1>
            <p className="mt-3 text-gray-600">
              Pick a city or type a location to browse verified tiffin services near you.
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.TiffinServiceWhereInput = {
    status: 'APPROVED',
    ...(city ? { city } : {}),
    ...(q
      ? {
        OR: [
          { city: { contains: q, mode: 'insensitive' } },
          { area: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }
      : {}),
    ...(vegOnly ? { isVegetarian: true, hasNonVeg: false } : {}),
    ...(meals.length > 0 ? { mealsOffered: { hasSome: meals } } : {}),
    ...(days.length > 0 ? { operationalDays: { hasSome: days } } : {}),
    ...(containers.length > 0
      ? { containerType: { in: containers as any[] } }
      : {}),
    ...(spices.length > 0
      ? { spiceLevel: { in: spices as any[] } }
      : {}),
    ...(minMealPrice !== undefined || maxMealPrice !== undefined || minMonthPrice !== undefined || maxMonthPrice !== undefined
      ? {
        offerings: {
          some: {
            ...(minMealPrice !== undefined || maxMealPrice !== undefined
              ? {
                searchPricePerMeal: {
                  ...(minMealPrice !== undefined ? { gte: minMealPrice } : {}),
                  ...(maxMealPrice !== undefined ? { lte: maxMealPrice } : {}),
                },
              }
              : {}),
            ...(minMonthPrice !== undefined || maxMonthPrice !== undefined
              ? {
                searchPricePerMonth: {
                  ...(minMonthPrice !== undefined ? { gte: minMonthPrice } : {}),
                  ...(maxMonthPrice !== undefined ? { lte: maxMonthPrice } : {}),
                },
              }
              : {}),
          },
        },
      }
      : {}),
  };

  const [listings, total] = await Promise.all([
    prisma.tiffinService.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        offerings: { orderBy: { sortOrder: 'asc' } },
        reviews: { select: { rating: true }, where: { isVisible: true } },
        _count: { select: { reviews: { where: { isVisible: true } } } },
      },
    }),
    prisma.tiffinService.count({ where }),
  ]);

  const cityDisplay = city ? toTitleCase(city) : (q ? `"${q}"` : 'all locations');
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : skip + 1;
  const to = skip + listings.length;
  const cards = listings.map(toListingCardProps);

  // Pagination base: every active param EXCEPT page.
  const baseParams = new URLSearchParams();
  if (city) baseParams.set('city', city);
  if (q) baseParams.set('q', q);
  if (vegOnly) baseParams.set('veg', 'true');
  if (meals.length > 0) baseParams.set('meals', meals.join(','));
  if (days.length > 0) baseParams.set('days', days.join(','));
  if (containers.length > 0) baseParams.set('containers', containers.join(','));
  if (spices.length > 0) baseParams.set('spices', spices.join(','));
  if (minMealPrice !== undefined) baseParams.set('minMealPrice', String(minMealPrice));
  if (maxMealPrice !== undefined) baseParams.set('maxMealPrice', String(maxMealPrice));
  if (minMonthPrice !== undefined) baseParams.set('minMonthPrice', String(minMonthPrice));
  if (maxMonthPrice !== undefined) baseParams.set('maxMonthPrice', String(maxMonthPrice));

  // JSON-LD ItemList of the current page's results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: cards.map((card, i) => ({
      '@type': 'ListItem',
      position: skip + i + 1,
      url: `https://tiffin.wiki/tiffin/${card.listing.slug}`,
      name: card.listing.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader showSearchBar defaultCity={city || undefined} defaultQ={q || undefined} />
      <main id="main-content" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left sidebar: Filter bar */}
            <aside className="w-full lg:w-60 shrink-0">
              <FilterBar
                currentCity={city || undefined}
                currentQ={q || undefined}
                currentVeg={vegOnly}
                currentMeals={meals}
                currentDays={days}
                currentContainers={containers}
                currentSpices={spices}
                currentMinMealPrice={minMealPrice}
                currentMaxMealPrice={maxMealPrice}
                currentMinMonthPrice={minMonthPrice}
                currentMaxMonthPrice={maxMonthPrice}
              />
            </aside>

            {/* Right main content: Results */}
            <div className="flex-1 w-full flex flex-col gap-6">
              {total === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-16 text-center bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <p className="text-lg text-gray-600">
                    No tiffin services found in {cityDisplay}.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 font-medium">
                    Showing {from}–{to} of {total} result{total === 1 ? '' : 's'} in {cityDisplay}
                  </p>
                  <ListingGrid listings={cards} />
                  <Pagination
                    currentPage={page}
                    baseUrl={baseParams.toString()}
                    totalPages={totalPages}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
