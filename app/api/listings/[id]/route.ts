import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { AdminEditSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { computeSearchPrices } from '@/lib/searchPrices';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = AdminEditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { offerings, ...scalarFields } = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    const updatedService = await tx.tiffinService.update({
      where: { id },
      data: {
        ...scalarFields,
        ...(scalarFields.city ? { city: scalarFields.city.toLowerCase() } : {}),
      },
      select: { id: true, slug: true, status: true, operationalDays: true },
    });

    if (offerings) {
      await tx.tiffinOffering.deleteMany({ where: { serviceId: id } });
      if (offerings.length > 0) {
        await tx.tiffinOffering.createMany({
          data: offerings.map((o, idx) => {
            const sp = computeSearchPrices(o.pricePerMeal, o.pricePerMonth, updatedService.operationalDays);
            return {
              serviceId: id,
              sizeName: o.sizeName,
              mealComponents: o.mealComponents,
              pricePerMeal: o.pricePerMeal ?? null,
              pricePerMonth: o.pricePerMonth ?? null,
              searchPricePerMeal: sp.searchPricePerMeal,
              searchPricePerMonth: sp.searchPricePerMonth,
              sortOrder: idx,
            };
          }),
        });
      }
    }

    return updatedService;
  });

  revalidatePath('/');
  revalidatePath('/search');
  revalidatePath('/admin');
  revalidatePath(`/tiffin/${updated.slug}`);

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const listing = await prisma.tiffinService.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  await prisma.tiffinService.delete({
    where: { id },
  });

  revalidatePath('/');
  revalidatePath('/search');
  revalidatePath('/admin');
  revalidatePath(`/tiffin/${listing.slug}`);

  return NextResponse.json({ success: true }, { status: 200 });
}
