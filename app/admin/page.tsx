import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AdminListingQueue } from '@/components/admin/AdminListingQueue';
import { AdminSearchInput } from '@/components/admin/AdminSearchInput';
import { AdminMonitoring, type TelemetryStatsData } from '@/components/admin/AdminMonitoring';
import { ShieldCheck, Clock, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; timeframe?: string }>;
}) {
  const { tab: tabParam, q: qParam, timeframe: timeframeParam } = await searchParams;
  const tab = (tabParam ?? 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED' | 'MONITORING';
  const searchQuery = (qParam ?? '').trim();
  const timeframe = timeframeParam ?? '24h';

  // Overall platform counts
  const [total, pending, approved, rejected, totalReviews, totalSignups, avgRatingAgg] = await Promise.all([
    prisma.tiffinService.count(),
    prisma.tiffinService.count({ where: { status: 'PENDING' } }),
    prisma.tiffinService.count({ where: { status: 'APPROVED' } }),
    prisma.tiffinService.count({ where: { status: 'REJECTED' } }),
    prisma.review.count(),
    prisma.user.count(),
    prisma.review.aggregate({ _avg: { rating: true }, where: { isVisible: true } }),
  ]);

  // If tab is MONITORING, compile full telemetry analytics dashboard data
  if (tab === 'MONITORING') {
    let dateThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (timeframe === '7d') {
      dateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '30d') {
      dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'all') {
      dateThreshold = new Date(0);
    }

    const whereTime = {
      createdAt: { gte: dateThreshold },
    };

    // Parallel telemetry queries
    const [
      whatsappReveals,
      whatsappOpens,
      totalSearches,
      totalPageviews,
      uniqueSessionsRes,
      avgDwellRes,
      approvedListingsWithCity,
      searchesByCity,
      topListingsEvents,
      topSearchQueries,
      vegFilterCount,
      mixedFilterCount,
      mobileCount,
      desktopCount,
      tabletCount,
      routeStatsRaw,
      listingViewsCount,
      addListingStarts,
      addListingSuccesses,
      reviewFormStarts,
      reviewFormSuccesses,
      recentEventsRaw,
    ] = await Promise.all([
      prisma.telemetryEvent.count({ where: { ...whereTime, eventType: 'WHATSAPP_REVEAL' } }),
      prisma.telemetryEvent.count({ where: { ...whereTime, eventType: 'WHATSAPP_OPEN' } }),
      prisma.telemetryEvent.count({
        where: {
          ...whereTime,
          OR: [
            { eventType: 'SEARCH_EXECUTE' },
            { searchQuery: { not: null } },
            { pathname: { startsWith: '/search' } },
          ],
        },
      }),
      prisma.telemetryEvent.count({ where: { ...whereTime, eventType: 'PAGE_VIEW' } }),
      prisma.telemetryEvent.groupBy({
        by: ['sessionId'],
        where: whereTime,
      }),
      prisma.telemetryEvent.aggregate({
        _avg: { durationSec: true },
        where: { ...whereTime, eventType: 'TIME_SPENT' },
      }),
      prisma.tiffinService.findMany({
        where: { status: 'APPROVED' },
        select: { city: true },
      }),
      prisma.telemetryEvent.groupBy({
        by: ['city'],
        where: { ...whereTime, city: { not: null } },
        _count: { city: true },
        orderBy: { _count: { city: 'desc' } },
        take: 10,
      }),
      prisma.telemetryEvent.groupBy({
        by: ['listingSlug', 'eventType'],
        where: { ...whereTime, listingSlug: { not: null } },
        _count: { listingSlug: true },
      }),
      prisma.telemetryEvent.groupBy({
        by: ['searchQuery'],
        where: { ...whereTime, searchQuery: { not: null } },
        _count: { searchQuery: true },
        orderBy: { _count: { searchQuery: 'desc' } },
        take: 8,
      }),
      prisma.telemetryEvent.count({
        where: { ...whereTime, filterName: 'veg', filterValue: 'true' },
      }),
      prisma.telemetryEvent.count({
        where: { ...whereTime, filterName: 'veg', filterValue: 'false' },
      }),
      prisma.telemetryEvent.count({ where: { ...whereTime, deviceType: 'mobile' } }),
      prisma.telemetryEvent.count({ where: { ...whereTime, deviceType: 'desktop' } }),
      prisma.telemetryEvent.count({ where: { ...whereTime, deviceType: 'tablet' } }),
      prisma.telemetryEvent.groupBy({
        by: ['pathname'],
        where: { ...whereTime, eventType: 'PAGE_VIEW' },
        _count: { pathname: true },
        orderBy: { _count: { pathname: 'desc' } },
        take: 10,
      }),
      prisma.telemetryEvent.count({
        where: { ...whereTime, eventType: 'PAGE_VIEW', pathname: { startsWith: '/tiffin/' } },
      }),
      prisma.telemetryEvent.count({
        where: { ...whereTime, eventType: 'PAGE_VIEW', pathname: '/add' },
      }),
      prisma.telemetryEvent.count({
        where: { ...whereTime, eventType: 'ADD_LISTING_SUCCESS' },
      }),
      prisma.telemetryEvent.count({
        where: { ...whereTime, eventType: 'REVIEW_BUTTON_CLICK' },
      }),
      prisma.telemetryEvent.count({
        where: { ...whereTime, eventType: 'REVIEW_SUBMIT_SUCCESS' },
      }),
      prisma.telemetryEvent.findMany({
        where: whereTime,
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    // City-wise Tiffins Breakdown
    const cityTiffinCountsMap: Record<string, number> = {};
    approvedListingsWithCity.forEach((l: { city: string }) => {
      const c = l.city.toLowerCase();
      cityTiffinCountsMap[c] = (cityTiffinCountsMap[c] || 0) + 1;
    });

    const citySearchMap: Record<string, number> = {};
    searchesByCity.forEach((s: { city: string | null; _count: { city: number } }) => {
      if (s.city) {
        citySearchMap[s.city.toLowerCase().trim()] = s._count.city;
      }
    });

    // Also populate from recent search queries if city field was null on older events
    recentEventsRaw.forEach((e) => {
      if (e.eventType === 'SEARCH_EXECUTE' || e.searchQuery || e.pathname.startsWith('/search')) {
        const loc = (e.city || e.searchQuery || '').toLowerCase().trim();
        if (loc) {
          citySearchMap[loc] = (citySearchMap[loc] || 0) + 1;
        }
      }
    });

    const citiesCoveredSet = new Set(Object.keys(cityTiffinCountsMap));
    const cityWiseTiffins = Array.from(citiesCoveredSet).map((c) => ({
      city: c,
      count: cityTiffinCountsMap[c] || 0,
      searchCount: citySearchMap[c] || 0,
    })).sort((a, b) => b.count - a.count);

    // Most popular city by searches
    let mostPopularCity = null;
    const sortedSearchCities = Object.entries(citySearchMap).sort((a, b) => b[1] - a[1]);
    if (sortedSearchCities.length > 0) {
      const [topCityName, topCount] = sortedSearchCities[0];
      const totalCitySearches = sortedSearchCities.reduce((acc, curr) => acc + curr[1], 0);
      mostPopularCity = {
        city: topCityName,
        count: topCount,
        percentage: totalCitySearches > 0 ? Math.round((topCount / totalCitySearches) * 100) : 100,
      };
    }

    // Top listings aggregator
    const listingStatsMap: Record<string, { views: number; whatsapp: number }> = {};
    topListingsEvents.forEach((item: { listingSlug: string | null; eventType: string; _count: { listingSlug: number } }) => {
      if (item.listingSlug) {
        if (!listingStatsMap[item.listingSlug]) {
          listingStatsMap[item.listingSlug] = { views: 0, whatsapp: 0 };
        }
        if (item.eventType === 'LISTING_VIEW' || item.eventType === 'PAGE_VIEW') {
          listingStatsMap[item.listingSlug].views += item._count.listingSlug;
        } else if (item.eventType === 'WHATSAPP_REVEAL' || item.eventType === 'WHATSAPP_OPEN') {
          listingStatsMap[item.listingSlug].whatsapp += item._count.listingSlug;
        }
      }
    });

    const topSlugs = Object.keys(listingStatsMap).slice(0, 10);
    const topListingsFromDb = await prisma.tiffinService.findMany({
      where: { slug: { in: topSlugs } },
      select: { id: true, name: true, slug: true, city: true },
    });

    const topListings = topListingsFromDb.map((l: { id: string; name: string; slug: string; city: string }) => ({
      id: l.id,
      name: l.name,
      slug: l.slug,
      city: l.city,
      viewsCount: listingStatsMap[l.slug]?.views || 0,
      whatsappCount: listingStatsMap[l.slug]?.whatsapp || 0,
    })).sort((a, b) => b.whatsappCount !== a.whatsappCount ? b.whatsappCount - a.whatsappCount : b.viewsCount - a.viewsCount);

    // Daily trend generator
    const dailyMap: Record<string, { views: number; sessions: Set<string>; searches: number; whatsapp: number }> = {};
    recentEventsRaw.forEach((evt) => {
      const dateKey = new Date(evt.createdAt).toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { views: 0, sessions: new Set(), searches: 0, whatsapp: 0 };
      }
      dailyMap[dateKey].sessions.add(evt.sessionId);
      if (evt.eventType === 'PAGE_VIEW') dailyMap[dateKey].views++;
      if (evt.eventType === 'SEARCH_EXECUTE') dailyMap[dateKey].searches++;
      if (evt.eventType === 'WHATSAPP_REVEAL' || evt.eventType === 'WHATSAPP_OPEN') dailyMap[dateKey].whatsapp++;
    });

    const dailyTrend = Object.keys(dailyMap)
      .sort()
      .slice(-14)
      .map((date) => ({
        date,
        views: dailyMap[date].views,
        sessions: dailyMap[date].sessions.size,
        searches: dailyMap[date].searches,
        whatsapp: dailyMap[date].whatsapp,
      }));

    // Hourly distribution generator (0 to 23)
    const hourlyCounts = new Array(24).fill(0);
    recentEventsRaw.forEach((evt) => {
      const hour = new Date(evt.createdAt).getHours();
      hourlyCounts[hour]++;
    });
    const hourlyDistribution = hourlyCounts.map((count, hour) => ({ hour, count }));

    // Route breakdown with average dwell time
    const routeBreakdown = routeStatsRaw.map((r: { pathname: string; _count: { pathname: number } }) => ({
      pathname: r.pathname,
      views: r._count.pathname,
      avgDwellSec: Math.round(avgDwellRes._avg.durationSec || 15),
    }));

    // Funnel calculations
    const whatsappTotal = whatsappReveals + whatsappOpens;
    const whatsappConversionRate = listingViewsCount > 0
      ? Math.round((whatsappTotal / listingViewsCount) * 100)
      : 0;

    const monitoringData: TelemetryStatsData = {
      timeframe,
      totals: {
        whatsappReveals,
        whatsappOpens,
        whatsappTotal,
        totalSignups,
        totalReviews,
        avgRating: avgRatingAgg._avg.rating ?? null,
        citiesCoveredCount: citiesCoveredSet.size,
        totalApprovedTiffins: approved,
        totalSearches,
        totalPageviews,
        uniqueSessions: uniqueSessionsRes.length,
        avgDwellTimeSec: Math.round(avgDwellRes._avg.durationSec || 0),
      },
      mostPopularCity,
      cityWiseTiffins,
      topListings,
      topSearches: topSearchQueries.map((q: { searchQuery: string | null; _count: { searchQuery: number } }) => ({
        query: q.searchQuery || '',
        count: q._count.searchQuery,
      })),
      filtersBreakdown: {
        vegCount: vegFilterCount,
        mixedCount: mixedFilterCount,
        topMeals: [],
        topContainers: [],
        topSpices: [],
      },
      deviceSplit: {
        mobile: mobileCount,
        desktop: desktopCount,
        tablet: tabletCount,
      },
      dailyTrend,
      hourlyDistribution,
      routeBreakdown,
      funnelMetrics: {
        listingViews: listingViewsCount,
        whatsappReveals,
        whatsappOpens,
        whatsappConversionRate,
        addListingStarts,
        addListingSuccesses,
        reviewFormStarts,
        reviewFormSuccesses,
      },
      recentEvents: recentEventsRaw.map((e) => ({
        id: e.id,
        sessionId: e.sessionId,
        eventType: e.eventType,
        pathname: e.pathname,
        searchQuery: e.searchQuery,
        city: e.city,
        listingSlug: e.listingSlug,
        ctaName: e.ctaName,
        filterName: e.filterName,
        filterValue: e.filterValue,
        durationSec: e.durationSec,
        deviceType: e.deviceType,
        geoCity: e.geoCity,
        country: e.country,
        createdAt: e.createdAt.toISOString(),
      })),
    };

    return (
      <div className="w-full min-h-screen bg-[#090d16] text-slate-100 p-4 sm:p-8 space-y-6">
        {/* Navigation Tab Bar */}
        <div className="border-b border-emerald-500/20 pb-2">
          <div className="flex gap-2 font-mono">
            {(['PENDING', 'APPROVED', 'REJECTED', 'MONITORING'] as const).map((t) => (
              <a
                key={t}
                href={`/admin?tab=${t}`}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  tab === t
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t === 'MONITORING' ? 'Monitoring & Telemetry' : t}
              </a>
            ))}
          </div>
        </div>

        {/* Telemetry Dashboard Component */}
        <AdminMonitoring data={monitoringData} />
      </div>
    );
  }

  // Queue tab queries
  const where: Prisma.TiffinServiceWhereInput = {
    ...(tab ? { status: tab as any } : {}),
    ...(searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { city: { contains: searchQuery, mode: 'insensitive' } },
            { area: { contains: searchQuery, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const listings = await prisma.tiffinService.findMany({
    where,
    orderBy: { createdAt: tab === 'PENDING' ? 'asc' : 'desc' },
    select: { id: true, name: true, city: true, status: true, createdAt: true },
  });

  const emptyMsg = searchQuery
    ? `No ${tab.toLowerCase()} listings matching "${searchQuery}".`
    : `No ${tab.toLowerCase()} listings.`;

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-slate-100 p-4 sm:p-8 space-y-6">
      {/* Header bar with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black font-mono tracking-tight text-white">
              ADMIN DASHBOARD <span className="text-emerald-400">&</span> QUEUE
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Manage tiffin service entries, review pending submissions, edit, and delete listings.
          </p>
        </div>
        <AdminSearchInput initialSearch={searchQuery} />
      </div>

      {/* Hero Cyber Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5 font-mono">
        {[
          { label: 'Total Listings', value: total, color: 'border-slate-700 text-white', icon: ShieldCheck },
          { label: 'Pending', value: pending, color: 'border-amber-500/30 text-amber-300', icon: Clock },
          { label: 'Approved', value: approved, color: 'border-emerald-500/30 text-emerald-300', icon: CheckCircle2 },
          { label: 'Rejected', value: rejected, color: 'border-red-500/30 text-red-300', icon: XCircle },
          { label: 'Reviews', value: totalReviews, color: 'border-purple-500/30 text-purple-300', icon: BarChart3 },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl border bg-slate-900/80 p-4 text-center backdrop-blur-md shadow-md ${color}`}>
            <div className="text-2xl font-black font-mono tracking-tight">{value}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-500/20 pb-2 gap-3 font-mono">
        <div className="flex gap-2">
          {(['PENDING', 'APPROVED', 'REJECTED', 'MONITORING'] as const).map((t) => {
            const params = new URLSearchParams();
            params.set('tab', t);
            if (searchQuery) params.set('q', searchQuery);
            return (
              <a
                key={t}
                href={`/admin?${params.toString()}`}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  tab === t
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                aria-current={tab === t ? 'page' : undefined}
              >
                {t === 'MONITORING' ? 'Monitoring & Telemetry' : t}
              </a>
            );
          })}
        </div>

        {searchQuery && (
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 self-start sm:self-auto">
            Matching &quot;{searchQuery}&quot; ({listings.length} found)
          </span>
        )}
      </div>

      {/* Listing table */}
      <AdminListingQueue listings={listings} emptyMessage={emptyMsg} />
    </div>
  );
}
