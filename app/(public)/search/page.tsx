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

// Fully dynamic — query-driven, no ISR.
export const dynamic = 'force-dynamic';

type RawSearchParams = {
  city?: string;
  q?: string;
  meal?: string;
  veg?: string;
  page?: string;
};

interface SearchPageProps {
  searchParams: Promise<RawSearchParams>;
}

const MEAL_VALUES = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
const PAGE_SIZE = 20;

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { city = '', q = '' } = await searchParams;
  const display = city ? titleCase(city) : (q ? `"${q}"` : 'India');
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
  const meal = MEAL_VALUES.includes(params.meal as (typeof MEAL_VALUES)[number])
    ? (params.meal as string)
    : undefined;
  const vegOnly = params.veg === 'true';

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
    ...(meal ? { mealsOffered: { has: meal } } : {}),
    ...(vegOnly ? { isVegetarian: true, hasNonVeg: false } : {}),
  };

  const [listings, total] = await Promise.all([
    prisma.tiffinService.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.tiffinService.count({ where }),
  ]);

  const cityDisplay = city ? titleCase(city) : (q ? `"${q}"` : 'all locations');
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : skip + 1;
  const to = skip + listings.length;
  const cards = listings.map(toListingCardProps);

  // Pagination base: every active param EXCEPT page.
  const baseParams = new URLSearchParams();
  if (city) baseParams.set('city', city);
  if (q) baseParams.set('q', q);
  if (meal) baseParams.set('meal', meal);
  if (vegOnly) baseParams.set('veg', 'true');

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
        <div className="container mx-auto flex flex-col gap-6 px-4 py-8">
          {/* Filter bar */}
          <FilterBar
            currentCity={city || undefined}
            currentMeal={meal}
            currentVeg={vegOnly}
            currentQ={q || undefined}
          />

          {total === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-16 text-center">
              <p className="text-lg text-gray-600">
                No tiffin services found in {cityDisplay}. Be the first to add one!
              </p>
              <div className="mt-6 flex justify-center">
                <Button href="/add" size="lg">
                  Add a tiffin
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600">
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
      </main>
      <SiteFooter />
    </>
  );
}
