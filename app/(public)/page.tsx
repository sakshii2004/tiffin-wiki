import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { toListingCardProps } from '@/lib/queries';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SearchBar } from '@/components/layout/SearchBar';
import { StatBadge } from '@/components/ui/StatBadge';
import { Button } from '@/components/ui/Button';
import { ListingGrid } from '@/components/listing/ListingGrid';

// ISR — Section 5.1
export const revalidate = 900; // 15 minutes

export const metadata: Metadata = {
  title: 'tiffin.wiki — Find tiffin services near you',
  description:
    'Community directory of home-style tiffin meal delivery services across India.',
  openGraph: {
    title: 'tiffin.wiki — Find tiffin services near you',
    description:
      'Community directory of home-style tiffin meal delivery services across India.',
    url: 'https://tiffin.wiki',
    images: [{ url: 'https://tiffin.wiki/og-image.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://tiffin.wiki' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'tiffin.wiki',
  url: 'https://tiffin.wiki',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://tiffin.wiki/search?city={city}&q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const HOW_IT_WORKS = [
  { step: 1, text: 'Someone lists a tiffin they know' },
  { step: 2, text: "We verify it's real" },
  { step: 3, text: 'You find it and call them' },
];

export default async function HomePage() {
  const [totalListings, cityCounts, recentListings] = await Promise.all([
    prisma.tiffinService.count({ where: { status: 'APPROVED' } }),
    prisma.tiffinService.groupBy({
      by: ['city'],
      where: { status: 'APPROVED' },
      _count: true,
    }),
    prisma.tiffinService.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        _count: { select: { reviews: true } },
      },
    }),
  ]);

  const totalCities = cityCounts.length;
  const cards = recentListings.map(toListingCardProps);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Homepage uses a plain header — the hero owns the only SearchBar. */}
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-black/5 bg-gradient-to-b from-brand-peridot/10 via-cream to-cream">
          {/* Soft decorative glow — purely cosmetic */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-brand-peridot/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-brand-maroon/10 blur-3xl"
          />
          <div className="container relative mx-auto flex flex-col items-center gap-6 px-4 py-20 text-center md:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-peridot/30 bg-white/70 px-4 py-1.5 text-sm font-semibold text-brand-maroon shadow-[var(--shadow-soft)] backdrop-blur">
              <span aria-hidden="true">🍱</span>
              Home-style meals, verified by the community
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-body md:text-6xl">
              Find your next <span className="text-brand-peridot">tiffin.</span>
            </h1>
            <p className="max-w-xl text-lg text-gray-600">
              A community directory of home-style meal services near you — discover,
              compare, and call them directly.
            </p>
            <div className="w-full max-w-2xl rounded-2xl border border-black/5 bg-white p-3 shadow-[var(--shadow-soft-lg)] md:p-4">
              <SearchBar />
            </div>
            <div className="flex items-center gap-3 pt-2 sm:gap-4">
              <StatBadge value={totalListings} label="services" />
              <StatBadge value={totalCities} label="cities" />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-20" aria-labelledby="how-it-works-heading">
          <div className="container mx-auto px-4">
            <h2
              id="how-it-works-heading"
              className="mb-12 text-center text-3xl font-bold text-body"
            >
              How it works
            </h2>
            <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {HOW_IT_WORKS.map(({ step, text }) => (
                <li
                  key={step}
                  className="flex flex-col items-center gap-4 rounded-2xl border border-black/5 bg-white px-6 py-8 text-center shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-soft-lg)]"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-peridot text-xl font-bold text-white shadow-[var(--shadow-soft)] ring-4 ring-brand-peridot/15"
                  >
                    {step}
                  </span>
                  <p className="max-w-[16rem] text-base text-gray-700">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Recently Added */}
        <section className="bg-gradient-to-b from-transparent to-brand-peridot/5 py-16 md:py-20" aria-labelledby="recently-added-heading">
          <div className="container mx-auto px-4">
            <h2
              id="recently-added-heading"
              className="mb-8 text-3xl font-bold text-body"
            >
              Recently added
            </h2>
            <ListingGrid
              listings={cards}
              emptyMessage="No listings yet — be the first to add one!"
            />
          </div>
        </section>

        {/* Add a tiffin callout */}
        <section className="px-4 py-12">
          <div className="container mx-auto flex flex-col items-center gap-5 rounded-3xl bg-body px-6 py-10 text-center shadow-[var(--shadow-soft-lg)] sm:flex-row sm:justify-between sm:px-12 sm:text-left">
            <div>
              <p className="text-xl font-bold text-white sm:text-2xl">
                Know a tiffin service?
              </p>
              <p className="mt-1 text-base text-white/70">
                Add it for free and help others find a good meal.
              </p>
            </div>
            <Button href="/add" size="lg" className="shrink-0">
              List it for free
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
