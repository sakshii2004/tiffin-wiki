import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { AdminEditSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Next.js 16: params is a Promise

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

  const updated = await prisma.tiffinService.update({
    where: { id },
    data: parsed.data,
    select: { id: true, slug: true, status: true },
  });

  // Reflect edits on the cached detail page (and homepage, in case name/city changed).
  revalidatePath('/');
  revalidatePath(`/tiffin/${updated.slug}`);

  return NextResponse.json(updated, { status: 200 });
}
