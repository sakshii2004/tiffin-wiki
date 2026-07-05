import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { StarRatingDisplay } from '@/components/ui/StarRatingDisplay';

export const metadata: Metadata = {
  title: 'Your Profile',
};

// Always dynamic — page content is specific to the authenticated user.
export const dynamic = 'force-dynamic';

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      createdAt: true,
      reviews: {
        where: { isVisible: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          body: true,
          createdAt: true,
          images: { select: { id: true, publicUrl: true } },
          service: { select: { name: true, slug: true, city: true } },
        },
      },
    },
  });

  if (!user) redirect('/api/auth/signin');

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {/* Profile hero — compact dot-grid banner */}
        <section
          className="relative overflow-hidden bg-white bg-linear-to-b from-brand-peridot/15 to-white -mt-18 md:-mt-22 pt-30 md:pt-37 pb-12 px-6"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(106, 163, 55, 0.3) 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
              maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
            }}
          />
          <div className="relative z-10 mx-auto max-w-6xl flex items-center gap-5">
            {user.image ? (
              <Image
                src={user.image}
                alt={`Avatar of ${user.name ?? 'user'}`}
                width={72}
                height={72}
                className="h-16 w-16 md:h-18 md:w-18 rounded-full object-cover ring-4 ring-white shadow-md"
              />
            ) : (
              <span className="flex h-16 w-16 md:h-18 md:w-18 items-center justify-center rounded-full bg-brand-peridot/20 text-xl font-bold text-[#0f172a] ring-4 ring-white shadow-md">
                {initials(user.name)}
              </span>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] leading-tight">
                {user.name ?? 'Your Profile'}
              </h1>
              {user.email && (
                <p className="text-sm text-[#475569] mt-0.5">{user.email}</p>
              )}
            </div>
          </div>
        </section>

        {/* Reviews section */}
        <section className="bg-white py-12 px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-xl md:text-2xl font-bold text-[#0f172a] mb-6">
              Your reviews{' '}
              <span className="text-base font-normal text-[#64748b]">
                ({user.reviews.length})
              </span>
            </h2>

            {user.reviews.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
                <p className="text-[#475569] mb-4">You haven't reviewed any tiffin service yet.</p>
                <Link
                  href="/search"
                  className="inline-block bg-[#b85c38] text-white rounded-full px-5 py-2.5 font-medium text-sm hover:opacity-90 transition-all"
                >
                  Explore listings
                </Link>
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {user.reviews.map((review) => (
                  <li key={review.id}>
                    <article className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm h-full">
                      {/* Service link */}
                      <Link
                        href={`/tiffin/${review.service.slug}`}
                        className="text-sm font-semibold text-[#b85c38] hover:underline underline-offset-2 truncate"
                      >
                        {review.service.name}
                        <span className="text-[#94a3b8] font-normal">
                          {' '}· {review.service.city.charAt(0).toUpperCase() + review.service.city.slice(1).toLowerCase()}
                        </span>
                      </Link>

                      <div className="flex items-center justify-between">
                        <StarRatingDisplay rating={review.rating} size="sm" />
                        <time
                          dateTime={review.createdAt.toISOString()}
                          className="text-xs text-[#94a3b8]"
                        >
                          {formatDate(review.createdAt)}
                        </time>
                      </div>

                      {review.body && (
                        <p className="text-sm text-[#475569] leading-relaxed line-clamp-4">
                          {review.body}
                        </p>
                      )}

                      {review.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {review.images.map((img) => (
                            <Image
                              key={img.id}
                              src={img.publicUrl}
                              alt="Review photo"
                              width={80}
                              height={80}
                              className="h-20 w-20 rounded-lg object-cover shrink-0"
                            />
                          ))}
                        </div>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
