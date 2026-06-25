import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="mb-4 text-2xl font-bold text-body">Page not found</h1>
        <p className="mb-8 text-gray-600">
          We couldn&apos;t find what you were looking for.
        </p>
        <Link href="/" className="font-semibold text-body underline">
          Go back home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
