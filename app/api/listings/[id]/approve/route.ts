import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Next.js 16: params is a Promise

  // Admin-only: check both session and ADMIN_EMAIL (defence in depth)
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await prisma.tiffinService.update({
    where: { id },
    data: { status: 'APPROVED' },
    select: { slug: true },
  });

  // Reflect the new APPROVED listing immediately in cached surfaces.
  revalidatePath('/'); // homepage "recently added"
  revalidatePath('/search'); // harmless even though search is force-dynamic
  revalidatePath(`/tiffin/${updated.slug}`); // detail page (ISR 300s)

  return NextResponse.json({ ok: true }, { status: 200 });
}
