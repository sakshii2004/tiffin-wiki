import Image from 'next/image';
import type { Review } from '@prisma/client';
import { StarRatingDisplay } from '@/components/ui/StarRatingDisplay';

interface ReviewImageLike {
  id: string;
  publicUrl: string;
}

interface ReviewCardProps {
  review: Review & {
    user: { name: string | null; image: string | null };
    images?: ReviewImageLike[];
  };
}

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
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { user, images } = review;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-[var(--shadow-soft)]">
      <header className="flex items-center gap-3">
        {user.image ? (
          <Image
            src={user.image}
            alt={`Avatar of ${user.name ?? 'reviewer'}`}
            width={40}
            height={40}
            loading="lazy"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-peridot/20 text-sm font-semibold text-body"
          >
            {initials(user.name)}
          </span>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-body">{user.name ?? 'Anonymous'}</span>
          <time dateTime={review.createdAt.toISOString()} className="text-xs text-gray-500">
            {formatDate(review.createdAt)}
          </time>
        </div>
        <div className="ml-auto">
          <StarRatingDisplay rating={review.rating} size="sm" />
        </div>
      </header>

      {review.body && <p className="text-sm text-body">{review.body}</p>}

      {images && images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img) => (
            <Image
              key={img.id}
              src={img.publicUrl}
              alt={`Review photo by ${user.name ?? 'reviewer'}`}
              width={96}
              height={96}
              loading="lazy"
              className="h-24 w-24 shrink-0 rounded-md object-cover"
            />
          ))}
        </div>
      )}
    </article>
  );
}
