import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ReviewSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { getClientIp, hashIp, RateLimiters } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  // Rate limiting per IP to prevent spam abuse
  const rawIp = getClientIp(req.headers);
  const ipHash = hashIp(rawIp);
  const rateLimit = RateLimiters.reviews(ipHash);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many reviews submitted. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.resetInSeconds),
        },
      },
    );
  }

  // Auth required (Section 8 — /api/reviews requires Google OAuth)
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { serviceId, rating, body: reviewBody, r2Keys } = parsed.data;

  // Verify the service exists and is APPROVED.
  // Use findFirst (NOT findUnique): findUnique's `where` only accepts unique
  // fields, and combining the unique `id` with the non-unique `status` is a
  // Prisma type error.
  const service = await prisma.tiffinService.findFirst({
    where: { id: serviceId, status: 'APPROVED' },
    select: { id: true },
  });
  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  // Enforce one review per user per service (Section 4.4).
  // The unique constraint will also catch this, but checking first gives a cleaner error.
  const existing = await prisma.review.findUnique({
    where: { serviceId_userId: { serviceId, userId: session.user.id } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: 'You have already reviewed this service' },
      { status: 409 },
    );
  }

  const review = await prisma.review.create({
    data: {
      serviceId,
      userId: session.user.id,
      rating,
      body: reviewBody ?? null,
      isVisible: true,
      images: {
        create: r2Keys.map((key) => ({
          r2Key: key,
        })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: review.id }, { status: 201 });
}
