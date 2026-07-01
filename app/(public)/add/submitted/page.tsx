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
      <main id="main-content" className="flex-1 relative z-10">
        <div className="mx-auto max-w-lg px-4 py-12 md:py-24">
          <div className="bg-white/95 backdrop-blur-[10px] rounded-3xl border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-8 md:p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#eef5e6] text-[#2d5c10] border border-[#b6d98a]/30 shadow-inner flex items-center justify-center text-3xl font-bold mb-6">
              ✓
            </div>
            <h1 className="mb-4 text-2xl md:text-3xl font-extrabold text-[#0f172a] tracking-tight leading-tight">
              Thank you! Your submission is under review.
            </h1>
            <p className="mb-8 leading-relaxed text-[#64748b] text-base">
              We manually verify each listing to keep the directory reliable. Once
              verified, it will appear on tiffin.wiki. This usually takes 1–3
              business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Link
                href="/add"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#6aa337] px-6 py-2.5 font-semibold text-white shadow-[0_4px_12px_rgba(106,163,55,0.2)] transition-all hover:bg-[#5b8c2e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6aa337] text-sm md:text-base w-full sm:w-auto cursor-pointer"
              >
                Add another tiffin
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2.5 font-semibold text-[#0f172a] transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 text-sm md:text-base w-full sm:w-auto cursor-pointer"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
