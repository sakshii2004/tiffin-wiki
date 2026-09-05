'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Users,
  MapPin,
  Search,
  Star,
  Clock,
  TrendingUp,
  Activity,
  Flame,
  Filter,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Monitor,
  Calendar,
  Globe,
  Layers,
  Sparkles,
  BarChart2,
  PieChart,
  Target,
  Zap,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { toTitleCase } from '@/lib/titleCase';

export interface TelemetryStatsData {
  timeframe: string; // '24h' | '7d' | '30d' | 'all'
  totals: {
    whatsappReveals: number;
    whatsappOpens: number;
    whatsappTotal: number;
    totalSignups: number;
    totalReviews: number;
    avgRating: number | null;
    citiesCoveredCount: number;
    totalApprovedTiffins: number;
    totalSearches: number;
    totalPageviews: number;
    uniqueSessions: number;
    avgDwellTimeSec: number;
  };
  mostPopularCity: { city: string; count: number; percentage: number } | null;
  cityWiseTiffins: { city: string; count: number; searchCount: number }[];
  topListings: {
    id: string;
    name: string;
    slug: string;
    city: string;
    viewsCount: number;
    whatsappCount: number;
  }[];
  topSearches: { query: string; count: number }[];
  filtersBreakdown: {
    vegCount: number;
    mixedCount: number;
    topMeals: { meal: string; count: number }[];
    topContainers: { type: string; count: number }[];
    topSpices: { level: string; count: number }[];
  };
  deviceSplit: { mobile: number; desktop: number; tablet: number };
  dailyTrend: { date: string; views: number; sessions: number; searches: number; whatsapp: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  routeBreakdown: { pathname: string; views: number; avgDwellSec: number }[];
  funnelMetrics: {
    listingViews: number;
    whatsappReveals: number;
    whatsappOpens: number;
    whatsappConversionRate: number; // percentage
    addListingStarts: number;
    addListingSuccesses: number;
    reviewFormStarts: number;
    reviewFormSuccesses: number;
  };
  recentEvents: {
    id: string;
    sessionId: string;
    eventType: string;
    pathname: string;
    searchQuery: string | null;
    city: string | null;
    listingSlug: string | null;
    ctaName: string | null;
    filterName: string | null;
    filterValue: string | null;
    durationSec: number | null;
    deviceType: string | null;
    geoCity: string | null;
    country: string | null;
    createdAt: string;
  }[];
}

interface AdminMonitoringProps {
  data: TelemetryStatsData;
}

const TIMEFRAMES = [
  { id: '24h', label: '24 Hours' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: 'all', label: 'All Time' },
] as const;

type SubTab = 'OVERVIEW' | 'TRAFFIC' | 'SEARCH_DEMAND' | 'CONVERSIONS' | 'LIVE_STREAM';

/**
 * Custom SVG Interactive Line Chart for Daily Metrics over Time
 */
function DailyMetricLineChart({
  dailyTrend,
  metricKey,
  label,
  color,
  gradientId,
}: {
  dailyTrend: TelemetryStatsData['dailyTrend'];
  metricKey: 'views' | 'sessions' | 'searches' | 'whatsapp';
  label: string;
  color: string; // e.g. "#10b981"
  gradientId: string;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; val: number; x: number; y: number } | null>(null);

  if (dailyTrend.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500 font-mono">
        No daily trend data available for selected timeframe.
      </div>
    );
  }

  const padding = 40;
  const width = 800;
  const height = 240;

  const values = dailyTrend.map((d) => d[metricKey]);
  const maxVal = Math.max(...values, 5);
  const minVal = 0;

  const points = dailyTrend.map((d, idx) => {
    const x = padding + (idx / Math.max(dailyTrend.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - ((d[metricKey] - minVal) / (maxVal - minVal)) * (height - 2 * padding);
    return { x, y, date: d.date, val: d[metricKey] };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="relative w-full overflow-x-auto font-mono">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = height - padding - pct * (height - 2 * padding);
          const gridVal = Math.round(minVal + pct * (maxVal - minVal));
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
              <text x={padding - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize="10">
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Smooth line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points & hover zones */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="#090d16"
              stroke={color}
              strokeWidth="2.5"
              className="transition-all duration-150 cursor-pointer hover:r-6"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            {/* Date label under X-axis */}
            <text x={pt.x} y={height - 12} textAnchor="middle" fill="#64748b" fontSize="9">
              {pt.date.slice(5)}
            </text>
          </g>
        ))}
      </svg>

      {/* Interactive hover tooltip */}
      {hoveredPoint && (
        <div
          className="absolute bg-slate-950 text-white text-xs p-2 rounded-xl border border-emerald-500/40 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 font-mono z-20"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100}%`,
          }}
        >
          <div className="font-bold text-emerald-400">{hoveredPoint.date}</div>
          <div className="text-slate-200">
            {label}: <span className="font-bold text-white">{hoveredPoint.val.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminMonitoring({ data }: AdminMonitoringProps) {
  const router = useRouter();
  const [subTab, setSubTab] = useState<SubTab>('OVERVIEW');
  const [activeMetricChart, setActiveMetricChart] = useState<'views' | 'sessions' | 'searches' | 'whatsapp'>('views');
  const [logFilter, setLogFilter] = useState<string>('ALL');

  const handleTimeframeChange = (tf: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', 'MONITORING');
    params.set('timeframe', tf);
    router.push(`/admin?${params.toString()}`);
  };

  const filteredLogs = data.recentEvents.filter((evt) => {
    if (logFilter === 'ALL') return true;
    return evt.eventType === logFilter;
  });

  return (
    <div className="space-y-8 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* ── Top Header & Timeframe Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-emerald-500/20 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Activity size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white font-mono">
                SYSTEM TELEMETRY <span className="text-emerald-400">&</span> MONITORING OS
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                <Activity size={10} className="animate-pulse" /> Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time user event analytics, daily trend line charts, conversion funnels, and system logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/MONITORING_GUIDE.md"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
            title="Read documentation explaining what each visualization means"
          >
            <BookOpen size={14} />
            <span>Metrics Guide</span>
          </a>

          {/* Timeframe Controls */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-emerald-500/20 backdrop-blur-md shadow-inner">
            <Calendar size={14} className="text-slate-400 ml-2" />
            <span className="text-xs text-slate-400 font-medium mr-1 font-mono">Timeframe:</span>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => handleTimeframeChange(tf.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  data.timeframe === tf.id
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORY SUB-TABS NAVIGATION BAR ── */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 font-mono">
        {[
          { id: 'OVERVIEW', label: 'Overview', icon: Sparkles },
          { id: 'TRAFFIC', label: 'Traffic & Dwell Time', icon: TrendingUp },
          { id: 'SEARCH_DEMAND', label: 'Search & Filters', icon: Search },
          { id: 'CONVERSIONS', label: 'Conversions & Funnels', icon: Target },
          { id: 'LIVE_STREAM', label: 'Live Event Stream', icon: Zap },
        ].map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setSubTab(st.id as SubTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === st.id
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <st.icon size={14} />
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 1: OVERVIEW
         ══════════════════════════════════════════════════════════════════════ */}
      {subTab === 'OVERVIEW' && (
        <div className="space-y-8">
          
          {/* Hero KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            
            {/* 1. WhatsApp Leads */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950/90 p-5 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                  <Sparkles size={14} /> WhatsApp Leads
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                  #1 KPI
                </span>
              </div>
              <div className="my-3">
                <div className="text-3xl font-black text-white font-mono tracking-tight text-emerald-300">
                  {data.totals.whatsappTotal.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                  <span>{data.totals.whatsappReveals} Reveals</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{data.totals.whatsappOpens} Opens</span>
                </div>
              </div>
              <div className="text-[10px] text-emerald-400/80 border-t border-emerald-500/20 pt-2 flex items-center justify-between font-mono">
                <span>Direct WhatsApp Contacts</span>
                <span>↗</span>
              </div>
            </div>

            {/* 2. Total Signups */}
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-slate-900/80 to-slate-950/90 p-5 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Total Signups
              </span>
              <div className="my-3">
                <div className="text-3xl font-black text-white font-mono tracking-tight text-cyan-300">
                  {data.totals.totalSignups.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Registered platform users
                </div>
              </div>
              <div className="text-[10px] text-cyan-400/80 border-t border-cyan-500/20 pt-2 flex items-center justify-between font-mono">
                <span>Community Members</span>
                <span>{data.totals.uniqueSessions} Unique Visitors</span>
              </div>
            </div>

            {/* 3. Cities & Tiffins */}
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-slate-900/80 to-slate-950/90 p-5 shadow-[0_0_15px_rgba(168,85,247,0.1)] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                Cities & Tiffins
              </span>
              <div className="my-3">
                <div className="text-3xl font-black text-white font-mono tracking-tight text-purple-300 flex items-baseline gap-2">
                  <span>{data.totals.citiesCoveredCount}</span>
                  <span className="text-xs font-semibold text-slate-400">Cities</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  {data.totals.totalApprovedTiffins} Live Tiffins
                </div>
              </div>
              <div className="text-[10px] text-purple-400/80 border-t border-purple-500/20 pt-2 flex items-center justify-between font-mono">
                <span>Footprint</span>
                <span>{data.cityWiseTiffins.length} Active Hubs</span>
              </div>
            </div>

            {/* 4. Searches & Top City */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-900/80 to-slate-950/90 p-5 shadow-[0_0_15px_rgba(245,158,11,0.1)] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                Total Searches
              </span>
              <div className="my-3">
                <div className="text-3xl font-black text-white font-mono tracking-tight text-amber-300">
                  {data.totals.totalSearches.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-300 mt-1 font-mono truncate">
                  {data.mostPopularCity ? (
                    <>Top: <strong className="text-amber-400 font-bold">{toTitleCase(data.mostPopularCity.city)}</strong> ({data.mostPopularCity.percentage}%)</>
                  ) : 'No search data'}
                </div>
              </div>
              <div className="text-[10px] text-amber-400/80 border-t border-amber-500/20 pt-2 flex items-center justify-between font-mono">
                <span>Search Intent</span>
                <span>High Demand</span>
              </div>
            </div>

            {/* 5. Reviews & Avg Rating */}
            <div className="relative overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-950/30 via-slate-900/80 to-slate-950/90 p-5 shadow-[0_0_15px_rgba(244,63,94,0.1)] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400 font-mono">
                Reviews & Rating
              </span>
              <div className="my-3">
                <div className="text-3xl font-black text-white font-mono tracking-tight text-pink-300 flex items-baseline gap-2">
                  <span>{data.totals.totalReviews}</span>
                  <span className="text-sm font-semibold text-amber-400 flex items-center gap-1">
                    ★ {data.totals.avgRating !== null ? data.totals.avgRating.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Community feedback
                </div>
              </div>
              <div className="text-[10px] text-pink-400/80 border-t border-pink-500/20 pt-2 flex items-center justify-between font-mono">
                <span>Trust Score</span>
                <span>Verified</span>
              </div>
            </div>

            {/* 6. Dwell Time */}
            <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-950/30 via-slate-900/80 to-slate-950/90 p-5 shadow-[0_0_15px_rgba(20,184,166,0.1)] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">
                Avg Dwell Time
              </span>
              <div className="my-3">
                <div className="text-3xl font-black text-white font-mono tracking-tight text-teal-300">
                  {data.totals.avgDwellTimeSec}s
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 font-mono">
                  <span className="flex items-center gap-1"><Smartphone size={10} /> {data.deviceSplit.mobile}</span>
                  <span className="flex items-center gap-1"><Monitor size={10} /> {data.deviceSplit.desktop}</span>
                </div>
              </div>
              <div className="text-[10px] text-teal-400/80 border-t border-teal-500/20 pt-2 flex items-center justify-between font-mono">
                <span>{data.totals.totalPageviews} Pageviews</span>
                <span>Dwell Time</span>
              </div>
            </div>

          </div>

          {/* Interactive Line Chart Section */}
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-mono">
                  <TrendingUp size={16} /> Daily Activity & Lead Velocity (Line Visualization)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Hover over data nodes for exact date and metric counts.
                </p>
              </div>

              {/* Chart Metric Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveMetricChart('views')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeMetricChart === 'views' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Visits
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetricChart('sessions')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeMetricChart === 'sessions' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sessions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetricChart('searches')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeMetricChart === 'searches' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Searches
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetricChart('whatsapp')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeMetricChart === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  WhatsApp Leads
                </button>
              </div>
            </div>

            {/* Line Chart Render */}
            <DailyMetricLineChart
              dailyTrend={data.dailyTrend}
              metricKey={activeMetricChart}
              label={
                activeMetricChart === 'views' ? 'Page Views' :
                activeMetricChart === 'sessions' ? 'Unique Visitors' :
                activeMetricChart === 'searches' ? 'Searches' : 'WhatsApp Leads'
              }
              color={
                activeMetricChart === 'views' ? '#06b6d4' :
                activeMetricChart === 'sessions' ? '#a855f7' :
                activeMetricChart === 'searches' ? '#f59e0b' : '#10b981'
              }
              gradientId={`grad_${activeMetricChart}`}
            />
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 2: TRAFFIC & DWELL TIME
         ══════════════════════════════════════════════════════════════════════ */}
      {subTab === 'TRAFFIC' && (
        <div className="space-y-8">
          
          {/* Line Chart for Visits & Sessions */}
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-mono">
              <TrendingUp size={16} /> Daily Visits & Unique Visitor Trends
            </h3>
            <DailyMetricLineChart
              dailyTrend={data.dailyTrend}
              metricKey="views"
              label="Daily Page Views"
              color="#06b6d4"
              gradientId="grad_traffic_views"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Hourly Usage Distribution (Peak Hours) */}
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-mono">
                  <Clock size={16} /> Hourly Peak Usage Heatmap (00:00 - 23:00)
                </h3>
                <span className="text-xs text-slate-400 font-mono">Hours (IST)</span>
              </div>

              <div className="grid grid-cols-12 gap-1.5 pt-3">
                {data.hourlyDistribution.map((item) => {
                  const maxH = Math.max(...data.hourlyDistribution.map((x) => x.count), 1);
                  const intensity = Math.round((item.count / maxH) * 100);
                  return (
                    <div key={item.hour} className="flex flex-col items-center gap-1 group relative">
                      <div className="w-full bg-slate-950 rounded-lg h-24 flex items-end p-1">
                        <div
                          className="w-full bg-emerald-500/80 rounded-md transition-all group-hover:bg-emerald-400"
                          style={{ height: `${Math.max(intensity, 8)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{String(item.hour).padStart(2, '0')}</span>

                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 bg-slate-950 text-white text-[10px] px-2 py-1 rounded border border-emerald-500/40 hidden group-hover:block font-mono whitespace-nowrap z-20">
                        {String(item.hour).padStart(2, '0')}:00 — <strong className="text-emerald-400">{item.count} events</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Route & Page Dwell Time Breakdown */}
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-mono">
                <Layers size={16} /> Route Views & Average Dwell Time
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase">
                      <th className="pb-2.5">Route Path</th>
                      <th className="pb-2.5 text-right">Pageviews</th>
                      <th className="pb-2.5 text-right">Avg Dwell Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.routeBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-500">No route statistics logged.</td>
                      </tr>
                    ) : (
                      data.routeBreakdown.map((r) => (
                        <tr key={r.pathname} className="hover:bg-slate-800/40">
                          <td className="py-2.5 text-slate-200 truncate max-w-[220px]">{r.pathname}</td>
                          <td className="py-2.5 text-right text-emerald-400 font-bold">{r.views}</td>
                          <td className="py-2.5 text-right text-slate-300">{r.avgDwellSec}s</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 3: SEARCH & FILTERS
         ══════════════════════════════════════════════════════════════════════ */}
      {subTab === 'SEARCH_DEMAND' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* City Supply vs Search Demand */}
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-mono">
                <MapPin size={16} /> City Tiffin Supply vs Search Demand
              </h3>

              <div className="space-y-3 pt-2">
                {data.cityWiseTiffins.map((item) => {
                  const maxVal = Math.max(...data.cityWiseTiffins.map((x) => x.count), 1);
                  const percent = Math.round((item.count / maxVal) * 100);
                  return (
                    <div key={item.city} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-semibold text-white">{toTitleCase(item.city)}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">{item.searchCount} Searches</span>
                          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {item.count} Live Tiffin{item.count === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Keyword Search Cloud & Filter Attributes */}
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-6 backdrop-blur-md space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-mono">
                <Filter size={16} /> Most Searched Keywords & Dietary Preference Ratio
              </h3>

              {/* Keywords */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Top Search Keywords</span>
                <div className="flex flex-wrap gap-2 pt-1 font-mono">
                  {data.topSearches.length === 0 ? (
                    <span className="text-xs text-slate-500">No keyword searches logged</span>
                  ) : (
                    data.topSearches.map((s) => (
                      <span
                        key={s.query}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-200 border border-slate-700/60"
                      >
                        &quot;{s.query}&quot; <span className="text-emerald-400 font-bold">({s.count})</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Dietary Ratio */}
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Dietary Preference Ratio</span>
                <div className="flex items-center gap-3 text-xs font-mono pt-1">
                  <div className="flex-1 bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-xl text-center">
                    <div className="font-bold text-emerald-400 text-lg">{data.filtersBreakdown.vegCount}</div>
                    <div className="text-[10px] text-slate-400">Pure Veg Preference</div>
                  </div>
                  <div className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-xl text-center">
                    <div className="font-bold text-slate-200 text-lg">{data.filtersBreakdown.mixedCount}</div>
                    <div className="text-[10px] text-slate-400">All / Mixed</div>
                  </div>
                </div>
              </div>

              {/* Additional Filter Breakdown */}
              {(data.filtersBreakdown.topMeals.length > 0 ||
                data.filtersBreakdown.topContainers.length > 0 ||
                data.filtersBreakdown.topSpices.length > 0) && (
                <div className="space-y-3 border-t border-slate-800 pt-4 font-mono text-xs">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Top Filtered Attributes</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {data.filtersBreakdown.topMeals.map((m) => (
                      <span key={m.meal} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                        {toTitleCase(m.meal)}: <strong className="text-emerald-400">{m.count}</strong>
                      </span>
                    ))}
                    {data.filtersBreakdown.topContainers.map((c) => (
                      <span key={c.type} className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300">
                        {toTitleCase(c.type)}: <strong className="text-teal-400">{c.count}</strong>
                      </span>
                    ))}
                    {data.filtersBreakdown.topSpices.map((s) => (
                      <span key={s.level} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        {toTitleCase(s.level)} Spice: <strong className="text-amber-400">{s.count}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 4: CONVERSIONS & FUNNELS
         ══════════════════════════════════════════════════════════════════════ */}
      {subTab === 'CONVERSIONS' && (
        <div className="space-y-8">
          
          {/* Conversion Funnel Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 1. WhatsApp Lead Funnel */}
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                1. WhatsApp Lead Conversion
              </span>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Detail Page Views</span>
                  <span className="font-bold text-white">{data.funnelMetrics.listingViews}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Number Reveals</span>
                  <span className="font-bold text-emerald-400">{data.funnelMetrics.whatsappReveals}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">WhatsApp Chat Opens</span>
                  <span className="font-bold text-emerald-300">{data.funnelMetrics.whatsappOpens}</span>
                </div>
                <div className="pt-2 flex items-center justify-between text-sm font-bold text-emerald-400">
                  <span>Conversion Rate</span>
                  <span>{data.funnelMetrics.whatsappConversionRate}%</span>
                </div>
              </div>
            </div>

            {/* 2. Add Listing Funnel */}
            <div className="rounded-2xl border border-purple-500/30 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                2. Add Tiffin Funnel
              </span>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Form Page Visits</span>
                  <span className="font-bold text-white">{data.funnelMetrics.addListingStarts}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Submissions Completed</span>
                  <span className="font-bold text-purple-300">{data.funnelMetrics.addListingSuccesses}</span>
                </div>
                <div className="pt-2 flex items-center justify-between text-sm font-bold text-purple-400">
                  <span>Completion Rate</span>
                  <span>
                    {data.funnelMetrics.addListingStarts > 0
                      ? Math.round((data.funnelMetrics.addListingSuccesses / data.funnelMetrics.addListingStarts) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Review Submission Funnel */}
            <div className="rounded-2xl border border-pink-500/30 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400 font-mono">
                3. Review Submission Funnel
              </span>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Review CTA Clicks</span>
                  <span className="font-bold text-white">{data.funnelMetrics.reviewFormStarts}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Reviews Posted</span>
                  <span className="font-bold text-pink-300">{data.funnelMetrics.reviewFormSuccesses}</span>
                </div>
                <div className="pt-2 flex items-center justify-between text-sm font-bold text-pink-400">
                  <span>Completion Rate</span>
                  <span>
                    {data.funnelMetrics.reviewFormStarts > 0
                      ? Math.round((data.funnelMetrics.reviewFormSuccesses / data.funnelMetrics.reviewFormStarts) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Leaderboard Table */}
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-mono">
              <Flame size={16} className="text-amber-400" /> Highest Converting Tiffin Services
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase">
                    <th className="pb-3">Rank & Name</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3 text-right">Views</th>
                    <th className="pb-3 text-right">WhatsApp Leads</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.topListings.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-medium text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3 text-slate-400">{toTitleCase(item.city)}</td>
                      <td className="py-3 text-right text-slate-300 font-semibold">{item.viewsCount}</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                          {item.whatsappCount}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/tiffin/${item.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400"
                        >
                          View <ExternalLink size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 5: LIVE EVENT STREAM
         ══════════════════════════════════════════════════════════════════════ */}
      {subTab === 'LIVE_STREAM' && (
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-950 p-6 space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                Recent Event Stream Log
              </h3>
            </div>

            {/* Event Filter Pills */}
            <div className="flex flex-wrap gap-1 text-[11px]">
              {['ALL', 'PAGE_VIEW', 'TIME_SPENT', 'SEARCH_EXECUTE', 'WHATSAPP_REVEAL', 'WHATSAPP_OPEN'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setLogFilter(f)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    logFilter === f
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Event Type</th>
                  <th className="pb-3 font-semibold">Route Path</th>
                  <th className="pb-3 font-semibold">Location / Device</th>
                  <th className="pb-3 font-semibold">Payload Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-600">
                      No telemetry events matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((evt) => {
                    const eventBadgeColor: Record<string, string> = {
                      WHATSAPP_REVEAL: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                      WHATSAPP_OPEN: 'bg-emerald-500 text-slate-950 font-bold',
                      PAGE_VIEW: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                      TIME_SPENT: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
                      SEARCH_EXECUTE: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                      FILTER_TOGGLE: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                      LISTING_VIEW: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
                    };

                    return (
                      <tr key={evt.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 text-slate-400 whitespace-nowrap">
                          {new Date(evt.createdAt).toLocaleTimeString('en-GB', { hour12: false })}
                        </td>
                        <td className="py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${eventBadgeColor[evt.eventType] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                            {evt.eventType}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-300 max-w-[200px] truncate">{evt.pathname}</td>
                        <td className="py-2.5 text-slate-400 whitespace-nowrap">
                          {evt.geoCity ? `${evt.geoCity}, ` : ''}{evt.country ?? 'IN'} ({evt.deviceType ?? 'web'})
                        </td>
                        <td className="py-2.5 text-slate-300">
                          {evt.searchQuery && <span className="text-amber-300 mr-2">q: &quot;{evt.searchQuery}&quot;</span>}
                          {evt.city && <span className="text-purple-300 mr-2">city: {evt.city}</span>}
                          {evt.durationSec && <span className="text-teal-300 mr-2">dwell: {evt.durationSec}s</span>}
                          {evt.filterName && <span className="text-emerald-300 mr-2">filter: {evt.filterName}={evt.filterValue}</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
