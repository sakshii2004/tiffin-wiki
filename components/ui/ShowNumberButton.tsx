'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ShowNumberButtonProps {
  whatsappNumber: string;
}

function formatNumber(raw: string): string {
  // Light formatting for readability; keeps the leading +.
  return raw.trim();
}

function toWaLink(raw: string): string {
  // wa.me expects digits only (no +, spaces, or dashes).
  const digits = raw.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}`;
}

/**
 * Reveals a WhatsApp number only after a click.
 *
 * Anti-scraping: the number string and the wa.me <a href> are NOT rendered in
 * the initial DOM. They are constructed client-side on click, so a static
 * page scrape sees only the button label.
 */
export function ShowNumberButton({ whatsappNumber }: ShowNumberButtonProps) {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <Button type="button" onClick={() => setRevealed(true)}>
        Show WhatsApp Number
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-lg font-semibold text-body">{formatNumber(whatsappNumber)}</span>
      <Button
        variant="whatsapp"
        href={toWaLink(whatsappNumber)}
        rel="noopener noreferrer"
        target="_blank"
      >
        Open in WhatsApp
      </Button>
    </div>
  );
}
