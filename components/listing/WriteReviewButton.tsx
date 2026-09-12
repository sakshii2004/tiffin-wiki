'use client';

import { Button } from '@/components/ui/Button';
import { useTelemetry } from '@/components/providers/TelemetryProvider';

interface WriteReviewButtonProps {
  slug: string;
  className?: string;
}

export function WriteReviewButton({ slug, className }: WriteReviewButtonProps) {
  const { trackEvent } = useTelemetry();

  const handleClick = () => {
    trackEvent('REVIEW_BUTTON_CLICK', {
      listingSlug: slug,
      ctaName: 'WRITE_REVIEW_BUTTON',
    });
  };

  return (
    <Button
      href={`/tiffin/${slug}/review`}
      variant="secondary"
      className={className}
      onClick={handleClick}
    >
      Write a Review
    </Button>
  );
}
