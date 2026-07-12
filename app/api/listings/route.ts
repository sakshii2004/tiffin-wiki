import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { AddListingSchema } from '@/lib/validations';
import { hashIp, checkAndIncrementRateLimit, RateLimitError } from '@/lib/rateLimit';
import { generateSlug } from '@/lib/slugify';
import { getPublicUrl } from '@/lib/r2';
import { prisma } from '@/lib/prisma';
import { computeSearchPrices } from '@/lib/searchPrices';

export async function POST(req: NextRequest) {
  // Step 46: Extract and hash the client IP. headers() is async in Next 16.
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const rawIp = forwarded ? forwarded.split(',')[0].trim() : '0.0.0.0';
  const ipHash = hashIp(rawIp);

  const body = await req.json();

  // Step 49 (BEFORE Zod): Honeypot check — silently return 200 if the bot-trap
  // field is non-empty. This MUST run before Zod validation: AddListingSchema
  // types `honeypot` as z.string().max(0), so a filled honeypot would otherwise
  // fail Zod and return a 400 that fingerprints the defence. We read it raw and
  // return a benign 200 so the trap is indistinguishable from success.
  if (typeof body?.honeypot === 'string' && body.honeypot.length > 0) {
    return NextResponse.json({ id: 'ok', slug: 'ok' }, { status: 200 });
  }

  // Step 48: Validate body with Zod (full AddListingSchema)
  const parsed = AddListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = parsed.data;

  // Step 50: Generate slug from name + city
  const slug = generateSlug(data.name, data.city);

  try {
    // Steps 47, 51, 52 — run in a single transaction so the rate-limit count only
    // increments if the listing insert succeeds.
    const listing = await prisma.$transaction(async (tx) => {
      // Step 47: Check rate limit (throws RateLimitError if exceeded)
      await checkAndIncrementRateLimit(ipHash, tx);

      // Step 51: Create TiffinService with status PENDING
      const created = await tx.tiffinService.create({
        data: {
          slug,
          name: data.name,
          city: data.city.toLowerCase(),
          area: data.area,
          whatsappNumber: data.whatsappNumber,
          isVegetarian: data.isVegetarian,
          hasNonVeg: data.hasNonVeg,
          mealsOffered: data.mealsOffered,
          spiceLevel: data.spiceLevel,
          containerType: data.containerType,
          requiresTiffinWash: data.requiresTiffinWash,
          operationalDays: data.operationalDays,
          offerings: {
            create: data.offerings.map((o, index) => {
              const sp = computeSearchPrices(o.pricePerMeal, o.pricePerMonth, data.operationalDays);
              return {
                sizeName: o.sizeName,
                mealComponents: o.mealComponents,
                pricePerMeal: o.pricePerMeal,
                pricePerMonth: o.pricePerMonth,
                searchPricePerMeal: sp.searchPricePerMeal,
                searchPricePerMonth: sp.searchPricePerMonth,
                sortOrder: index,
              };
            }),
          },
          deliveryAreas: data.deliveryAreas,
          description: data.description,
          submitterNote: data.submitterNote,
          submitterIp: ipHash, // Hashed — never store raw IP
          status: 'PENDING',
          // Create ServiceImage rows for each uploaded R2 key
          images: {
            create: data.r2Keys.map((key, index) => ({
              r2Key: key,
              publicUrl: getPublicUrl(key),
              sortOrder: index,
            })),
          },
        },
        select: { id: true, slug: true },
      });

      return created;
    });

    // Step 53: Return 201 with id and slug
    return NextResponse.json({ id: listing.id, slug: listing.slug }, { status: 201 });
  } catch (err) {
    if (err instanceof RateLimitError) {
      // Rate limit exceeded: return 429
      return NextResponse.json(
        { error: "You've submitted 5 listings today. Try again tomorrow." },
        { status: 429 },
      );
    }
    // Unexpected errors — log server-side, never expose details to client
    console.error('[POST /api/listings]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
