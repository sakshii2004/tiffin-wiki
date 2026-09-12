import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CuidParamSchema } from '@/lib/validations';
import { getClientIp, hashIp, RateLimiters } from '@/lib/rateLimit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Validate CUID format to reject malformed parameters early
  if (!CuidParamSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid listing ID format' }, { status: 400 });
  }

  // IP-based rate limiting to prevent automated scraping of phone numbers
  const rawIp = getClientIp(req.headers);
  const ipHash = hashIp(rawIp);
  const rateLimit = RateLimiters.phoneReveal(ipHash);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many phone number requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.resetInSeconds),
        },
      },
    );
  }

  // Query only approved listings
  const service = await prisma.tiffinService.findFirst({
    where: { id, status: 'APPROVED' },
    select: { whatsappNumber: true },
  });

  if (!service) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  return NextResponse.json(
    { whatsappNumber: service.whatsappNumber },
    { status: 200 },
  );
}
