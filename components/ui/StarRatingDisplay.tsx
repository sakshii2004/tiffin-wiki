import { Star } from 'lucide-react';

type Size = 'sm' | 'md' | 'lg';
type StarColor = 'amber' | 'terracotta';

const sizePx: Record<Size, number> = {
  sm: 13,
  md: 16,
  lg: 20,
};

const filledColorClass: Record<StarColor, string> = {
  amber: 'text-amber-500',
  terracotta: 'text-[#b85c38]',
};

interface StarRatingDisplayProps {
  rating: number;
  maxRating?: number; // default 5
  size?: Size;
  color?: StarColor;
}

/**
 * Read-only star rating. Server Component (no `'use client'`), so it can be
 * rendered directly inside other Server Components such as ReviewCard.
 *
 * Individual stars are decorative (`aria-hidden`); the accessible value is
 * exposed once via the container's aria-label.
 */
export function StarRatingDisplay({ rating, maxRating = 5, size = 'md', color = 'amber' }: StarRatingDisplayProps) {
  const rounded = Math.round(rating);
  const px = sizePx[size];
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`Rating: ${rating} out of ${maxRating}`}
    >
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < rounded;
        return (
          <Star
            key={i}
            size={px}
            aria-hidden="true"
            className={filled ? filledColorClass[color] : 'text-gray-300'}
            fill="currentColor"
            strokeWidth={0}
          />
        );
      })}
    </span>
  );
}
