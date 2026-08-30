import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getClientIp, hashIp, RateLimiters } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const rawIp = getClientIp(req.headers);
    const ipHash = hashIp(rawIp);

    // IP-based rate limiting on telemetry ingestion (max 60 batch requests per minute)
    const rateLimit = RateLimiters.telemetry(ipHash);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many telemetry events. Rate limit exceeded.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetInSeconds),
          },
        },
      );
    }

    const country = req.headers.get('x-vercel-ip-country') || req.headers.get('x-geo-country') || undefined;
    const geoCity = req.headers.get('x-vercel-ip-city') || req.headers.get('x-geo-city') || undefined;

    let text = '';
    try {
      text = await req.text();
    } catch {
      text = '';
    }

    if (!text) {
      return NextResponse.json({ success: true, count: 0 }, { status: 200 });
    }

    let payload: any = null;
    try {
      payload = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const eventsList = Array.isArray(payload) ? payload : [payload];

    const records = eventsList
      .filter((e) => e && typeof e === 'object' && e.eventType && e.sessionId)
      .filter((e) => {
        const path = String(e.pathname || '/');
        return !path.startsWith('/admin') && !path.startsWith('/api');
      })
      .map((e) => ({
        sessionId: String(e.sessionId),
        eventType: String(e.eventType),
        pathname: String(e.pathname || '/'),
        searchQuery: e.searchQuery ? String(e.searchQuery) : null,
        city: e.city ? String(e.city) : null,
        listingId: e.listingId ? String(e.listingId) : null,
        listingSlug: e.listingSlug ? String(e.listingSlug) : null,
        ctaName: e.ctaName ? String(e.ctaName) : null,
        filterName: e.filterName ? String(e.filterName) : null,
        filterValue: e.filterValue ? String(e.filterValue) : null,
        durationSec: typeof e.durationSec === 'number' ? Math.round(e.durationSec) : null,
        rating: typeof e.rating === 'number' ? Math.round(e.rating) : null,
        deviceType: e.deviceType ? String(e.deviceType) : null,
        ipHash,
        country,
        geoCity,
        referrer: e.referrer ? String(e.referrer) : null,
      }));

    if (records.length > 0) {
      await prisma.telemetryEvent.createMany({
        data: records,
      });
    }

    return NextResponse.json({ success: true, count: records.length }, { status: 200 });
  } catch (error) {
    console.error('Telemetry ingestion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
