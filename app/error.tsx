'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Never expose stack traces to the user (Section 5.10).
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="mb-4 text-2xl font-bold text-body">Something went wrong</h1>
        <p className="mb-8 text-gray-600">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="font-semibold text-body underline"
          >
            Try again
          </button>
          <Link href="/" className="text-gray-500 underline">
            Go home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
