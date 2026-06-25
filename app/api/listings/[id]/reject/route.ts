import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { AdminRejectSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Next.js 16: params is a Promise

  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = AdminRejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const updated = await prisma.tiffinService.update({
    where: { id },
    data: { status: 'REJECTED', adminNote: parsed.data.adminNote },
    select: { slug: true },
  });

  // If the listing had been live, drop it from cached public surfaces.
  revalidatePath('/');
  revalidatePath('/search');
  revalidatePath(`/tiffin/${updated.slug}`);

  return NextResponse.json({ ok: true }, { status: 200 });
}
