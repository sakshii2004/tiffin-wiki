import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Submission received — tiffin.wiki",
  // noindex: this confirmation page should not appear in search results
  robots: { index: false, follow: false },
};

export default function SubmittedPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="mb-4 text-3xl font-bold text-body">
            Thank you! Your submission is under review.
          </h1>
          <p className="mb-8 leading-relaxed text-gray-600">
            We manually verify each listing to keep the directory reliable. Once
            verified, it will appear on tiffin.wiki. This usually takes 1–3
            business days.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/add"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-brand-peridot px-6 py-2 font-semibold text-white shadow-[var(--shadow-soft)] transition-all hover:opacity-90 hover:shadow-[var(--shadow-soft-lg)] focus-visible:ring-2 focus-visible:ring-body"
            >
              Add another tiffin service
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-gray-300 px-6 py-2 text-body transition hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-brand-peridot"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
