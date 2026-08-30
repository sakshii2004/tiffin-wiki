import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, CheckCircle, Plus, Search } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { HeroSearchBar } from '@/components/layout/HeroSearchBar';
import { HeroPolaroids } from '@/components/ui/HeroPolaroids';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { toListingCardProps } from '@/lib/queries';

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
    images: [{ url: '/tiffin-wiki-logo.png', width: 1200, height: 630 }],
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


export default async function HomePage() {
  const trendingListings = await prisma.tiffinService.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      offerings: { orderBy: { sortOrder: 'asc' } },
      reviews: { select: { rating: true }, where: { isVisible: true } },
      _count: { select: { reviews: { where: { isVisible: true } } } },
    },
  });

  const cards = trendingListings.map(toListingCardProps);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Homepage uses a plain header — the hero owns the only search elements. */}
      <SiteHeader />
      
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white bg-gradient-to-b from-[#6aa337]/15 to-white -mt-[72px] md:-mt-[88px] pt-[152px] md:pt-[200px] pb-20 md:pb-28 px-6 text-center">
          {/* Dot Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              backgroundImage: 'radial-gradient(rgba(106, 163, 55, 0.3) 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
              maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
            }}
          />

          {/* Interactive CSS Polaroid Mockups */}
          <div className="mx-auto max-w-[800px] flex flex-col items-center relative min-h-[380px]">
            <HeroPolaroids side="left" />
            <HeroPolaroids side="right" />

            {/* Centered Text & Search Block (Always on top at z-20) */}
            <div className="relative z-20 flex flex-col items-center w-full pointer-events-auto">
              <h1 className="text-4xl font-extrabold tracking-tight text-[#0f172a] sm:text-5xl md:text-6xl leading-[1.15] mb-6">
                Discover hidden <span className="text-[#b85c38]">home-cooked</span> meals.
              </h1>
              <p className="max-w-[520px] text-lg text-[#475569] mb-9 leading-relaxed">
                The community-maintained directory of unlisted local tiffin services, rated and reviewed by people like you.
              </p>
              <HeroSearchBar />
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="bg-white py-16 px-6">
          <div className="mx-auto max-w-[1152px]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-9">
              <h2 className="text-2xl md:text-[26px] font-bold text-[#0f172a] flex items-center gap-2.5 margin-0">
                <TrendingUp className="text-[#b85c38]" size={24} />
                <span>Trending near you</span>
              </h2>
              <Link 
                href="/search?sort=popularity" 
                className="text-[#3d7a2a] hover:text-[#2d5c10] transition-colors font-semibold text-sm flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d7a2a]"
              >
                View all mapped tiffins →
              </Link>
            </div>

            {cards.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center text-slate-500">
                No listings yet — be the first to add one!
              </p>
            ) : (
              <ListingGrid listings={cards} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" />
            )}
          </div>
        </section>

        {/* Built by the Community Section */}
        <section className="bg-[#0f172a] text-white py-12 px-6">
          <div className="mx-auto max-w-[1152px]">
            <div className="text-center mb-10">
              <h2 className="text-[28px] font-bold mb-3">Built by the community. For the community.</h2>
              <p className="text-[#94a3b8] max-w-[480px] mx-auto text-sm md:text-base leading-relaxed">
                Tiffin services rarely have websites. We rely on your contributions to keep the local food ecosystem mapped and accurate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="px-4">
                <div className="w-16 h-16 bg-[#1e293b] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#3d7a2a] shadow-sm">
                  <Search size={20} />
                </div>
                <h3 className="text-lg font-bold mb-2.5">1. Discover</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">Search for unlisted tiffin providers by area, price, and dietary preference.</p>
              </div>

              <div className="px-4">
                <div className="w-16 h-16 bg-[#1e293b] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#3d7a2a] shadow-sm">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-lg font-bold mb-2.5">2. Taste & Review</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">Upvote verified numbers, review hygiene, and flag closed services.</p>
              </div>

              <div className="px-4">
                <div className="w-16 h-16 bg-[#1e293b] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#3d7a2a] shadow-sm">
                  <Plus size={32} />
                </div>
                <h3 className="text-lg font-bold mb-2.5">3. Map the Unlisted</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">Know a great local dabba? Add their details so others can find them.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Know a Tiffin Service Callout */}
        <section className="py-12 px-6 bg-slate-50 border-t border-[#e2e8f0]">
          <div className="mx-auto max-w-[1152px] bg-white border border-[#e2e8f0] shadow-sm rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-2xl font-bold text-[#0f172a]">Know a tiffin service?</h2>
              <p className="text-[#64748b] text-[15px] mt-1">Add it for free and help others find a good meal.</p>
            </div>
            <Link
              href="/add"
              className="bg-[#b85c38] text-white rounded-full px-6 py-3 font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#b85c38] focus:ring-offset-2 shrink-0"
            >
              <Plus size={18} />
              <span>List it for free</span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
