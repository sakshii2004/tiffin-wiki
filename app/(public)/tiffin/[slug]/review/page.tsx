import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ReviewForm } from '@/components/forms/ReviewForm';

interface ReviewPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Write a review — tiffin.wiki`,
    robots: { index: false, follow: false }, // Review form should not be indexed
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { slug } = await params; // Next.js 16: params is a Promise
  const session = await auth();

  // If not signed in, redirect to Google sign-in with callbackUrl set to this page.
  // After sign-in, NextAuth returns the user to exactly this review URL.
  if (!session?.user?.id) {
    redirect(
      `/api/auth/signin?callbackUrl=${encodeURIComponent(`/tiffin/${slug}/review`)}`,
    );
  }

  // Fetch the listing to get the serviceId.
  // NOTE: use findFirst (NOT findUnique) — findUnique only accepts unique fields
  // in `where`, and `status` is not unique, so combining slug + status there is a
  // type error. findFirst allows the extra non-unique filter.
  const listing = await prisma.tiffinService.findFirst({
    where: { slug, status: 'APPROVED' },
    select: { id: true, name: true },
  });

  if (!listing) redirect(`/tiffin/${slug}`);

  // Guard: if the user already reviewed this service, redirect back with a flag.
  const existingReview = await prisma.review.findUnique({
    where: { serviceId_userId: { serviceId: listing.id, userId: session.user.id } },
    select: { id: true },
  });

  if (existingReview) {
    redirect(`/tiffin/${slug}?alreadyReviewed=1`);
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-12">
          <h1 className="mb-2 text-2xl font-bold text-body">
            Write a review for {listing.name}
          </h1>
          <p className="mb-8 text-gray-600">Share your experience to help others.</p>
          <ReviewForm serviceId={listing.id} slug={slug} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
