type Size = 'sm' | 'md' | 'lg';

const sizeClass: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

interface StarRatingDisplayProps {
  rating: number;
  maxRating?: number; // default 5
  size?: Size;
}

/**
 * Read-only star rating. Server Component (no `'use client'`), so it can be
 * rendered directly inside other Server Components such as ReviewCard.
 *
 * Individual stars are decorative (`aria-hidden`); the accessible value is
 * exposed once via the container's aria-label.
 */
export function StarRatingDisplay({ rating, maxRating = 5, size = 'md' }: StarRatingDisplayProps) {
  const rounded = Math.round(rating);
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${sizeClass[size]}`}
      role="img"
      aria-label={`Rating: ${rating} out of ${maxRating}`}
    >
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < rounded;
        return (
          <span
            key={i}
            aria-hidden="true"
            className={filled ? 'text-amber-500' : 'text-gray-300'}
          >
            ★
          </span>
        );
      })}
    </span>
  );
}
