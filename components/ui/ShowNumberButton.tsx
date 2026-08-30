'use client';

import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTelemetry } from '@/components/providers/TelemetryProvider';

interface ShowNumberButtonProps {
  whatsappNumber: string;
}

function formatNumber(raw: string): string {
  const clean = raw.trim();
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  if (clean.startsWith('+91') && clean.length === 13) {
    const main = clean.slice(3);
    return `+91 ${main.slice(0, 5)} ${main.slice(5)}`;
  }
  return clean;
}

function toWaLink(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  const prefix = digits.length === 10 ? '91' : '';
  const fullNumber = `${prefix}${digits}`;
  return `https://api.whatsapp.com/send?phone=${fullNumber}`;
}

/**
 * Native HTML disclosure WhatsApp button with telemetry event tracking.
 */
export function ShowNumberButton({ whatsappNumber }: ShowNumberButtonProps) {
  const { trackEvent } = useTelemetry();
  const formatted = formatNumber(whatsappNumber);
  const waUrl = toWaLink(whatsappNumber);

  const baseClasses =
    'inline-flex items-center justify-center rounded-full font-semibold transition-all ' +
    'min-h-[44px] min-w-[44px] px-4 py-2 text-sm bg-green-600 text-white shadow-[var(--shadow-soft)] ' +
    'hover:opacity-90 active:scale-95 cursor-pointer select-none touch-manipulation ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2';

  return (
    <details className="group relative inline-block w-full sm:w-auto">
      <summary
        onClick={() => trackEvent('WHATSAPP_REVEAL', { ctaName: 'WHATSAPP_REVEAL' })}
        className={cn(
          baseClasses,
          'flex items-center gap-2 w-full sm:w-auto group-open:hidden list-none [&::-webkit-details-marker]:hidden'
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 shrink-0"
          aria-hidden="true"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.288 1.488 4.654 1.489 5.433 0 9.85-4.386 9.853-9.78.002-2.612-1.015-5.07-2.864-6.92C16.48 2.09 14.02 1.07 11.411 1.07 5.976 1.07 1.557 5.457 1.554 10.85c-.001 1.77.466 3.493 1.353 5.04l-.895 3.27 3.344-.876zm12.434-5.066c-.324-.162-1.92-.949-2.217-1.058-.297-.11-.513-.162-.73.162-.216.324-.838 1.058-1.027 1.275-.189.217-.378.243-.702.08-1.748-.872-3.003-1.802-4.225-3.896-.324-.556.324-.516.927-1.717.108-.22.054-.413-.027-.575-.08-.162-.73-1.76-.999-2.409-.262-.63-.53-.545-.73-.555l-.62-.01c-.217 0-.568.08-.865.405-.297.324-1.135 1.109-1.135 2.7 0 1.591 1.162 3.129 1.324 3.345.162.216 2.288 3.494 5.542 4.9.774.334 1.378.533 1.849.682.778.247 1.487.212 2.047.129.624-.093 1.92-.786 2.19-1.507.27-.72.27-1.339.189-1.472-.081-.133-.297-.216-.62-.379z"/>
        </svg>
        <span>Show WhatsApp Number</span>
      </summary>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('WHATSAPP_OPEN', { ctaName: 'WHATSAPP_OPEN' })}
        className={cn(
          baseClasses,
          'hidden group-open:inline-flex items-center gap-2 font-bold w-full sm:w-auto'
        )}
        title="Open chat in WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 shrink-0"
          aria-hidden="true"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.288 1.488 4.654 1.489 5.433 0 9.85-4.386 9.853-9.78.002-2.612-1.015-5.07-2.864-6.92C16.48 2.09 14.02 1.07 11.411 1.07 5.976 1.07 1.557 5.457 1.554 10.85c-.001 1.77.466 3.493 1.353 5.04l-.895 3.27 3.344-.876zm12.434-5.066c-.324-.162-1.92-.949-2.217-1.058-.297-.11-.513-.162-.73.162-.216.324-.838 1.058-1.027 1.275-.189.217-.378.243-.702.08-1.748-.872-3.003-1.802-4.225-3.896-.324-.556.324-.516.927-1.717.108-.22.054-.413-.027-.575-.08-.162-.73-1.76-.999-2.409-.262-.63-.53-.545-.73-.555l-.62-.01c-.217 0-.568.08-.865.405-.297.324-1.135 1.109-1.135 2.7 0 1.591 1.162 3.129 1.324 3.345.162.216 2.288 3.494 5.542 4.9.774.334 1.378.533 1.849.682.778.247 1.487.212 2.047.129.624-.093 1.92-.786 2.19-1.507.27-.72.27-1.339.189-1.472-.081-.133-.297-.216-.62-.379z"/>
        </svg>
        <span>{formatted}</span>
        <ArrowUpRight className="w-4 h-4 shrink-0 stroke-[2.5]" aria-hidden="true" />
      </a>
    </details>
  );
}
