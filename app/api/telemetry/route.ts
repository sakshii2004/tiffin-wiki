import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getClientIp, hashIp, RateLimiters } from '@/lib/rateLimit';
import { TelemetryEventSchema } from '@/lib/validations';

const MAX_BATCH_SIZE = 50;

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

    let payload: unknown = null;
    try {
      payload = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const rawList = Array.isArray(payload) ? payload.slice(0, MAX_BATCH_SIZE) : [payload];

    const records = [];
    for (const item of rawList) {
      const parsed = TelemetryEventSchema.safeParse(item);
      if (!parsed.success) continue;

      const data = parsed.data;
      const path = data.pathname || '/';
      if (path.startsWith('/admin') || path.startsWith('/api')) {
        continue;
      }

      records.push({
        sessionId: data.sessionId,
        eventType: data.eventType,
        pathname: path,
        searchQuery: data.searchQuery ?? null,
        city: data.city ?? null,
        listingId: data.listingId ?? null,
        listingSlug: data.listingSlug ?? null,
        ctaName: data.ctaName ?? null,
        filterName: data.filterName ?? null,
        filterValue: data.filterValue ?? null,
        durationSec: data.durationSec ?? null,
        rating: data.rating ?? null,
        deviceType: data.deviceType ?? null,
        ipHash,
        country,
        geoCity,
        referrer: data.referrer ?? null,
      });
    }

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
