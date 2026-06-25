'use client';

import { useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import { FOCUS_RING } from '@/components/ui/styles';

type Size = 'sm' | 'md' | 'lg';

const sizeClass: Record<Size, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

interface StarRatingInteractiveProps {
  rating: number;
  onChange: (rating: number) => void;
  maxRating?: number; // default 5
  size?: Size;
}

/**
 * Interactive (clickable / keyboard) star rating. Client Component.
 * - Each star is a real <button> with an accessible label.
 * - Arrow keys move the value; Enter/Space confirm the focused star.
 * - Hover shows a visual preview without committing the value.
 */
export function StarRatingInteractive({
  rating,
  onChange,
  maxRating = 5,
  size = 'md',
}: StarRatingInteractiveProps) {
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? rating;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(Math.min(maxRating, rating + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(Math.max(1, rating - 1));
    }
  }

  return (
    <div
      className={`inline-flex items-center gap-1 ${sizeClass[size]}`}
      role="radiogroup"
      aria-label="Select a rating"
      onKeyDown={handleKeyDown}
    >
      {Array.from({ length: maxRating }, (_, i) => {
        const value = i + 1;
        const filled = value <= active;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`Rate ${value} out of ${maxRating}`}
            onClick={() => onChange(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(value)}
            onBlur={() => setHover(null)}
            className={cn(
              'leading-none transition-colors',
              FOCUS_RING,
              filled ? 'text-amber-500' : 'text-gray-300',
            )}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
