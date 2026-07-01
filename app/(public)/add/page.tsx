import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AddListingForm } from "@/components/forms/AddListingForm";
import { AddListingPolaroids } from "@/components/ui/HeroPolaroids";

export const metadata: Metadata = {
  title: "List a tiffin service — tiffin.wiki",
  description: "Add a tiffin service to our free community directory.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://tiffin.wiki/add" },
};

export default function AddListingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 relative z-10">
        <div className="mx-auto max-w-2xl px-4 py-12 md:py-20 relative">
          <AddListingPolaroids side="left" />
          <AddListingPolaroids side="right" />
          <h1 className="mb-2 text-3xl md:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            Add a <span className="text-[#b85c38]">tiffin</span> service
          </h1>
          <p className="mb-8 text-[#64748b] text-base md:text-lg">
            Know a great tiffin service? List it for free.
          </p>
          <div className="bg-white/95 backdrop-blur-[10px] rounded-3xl border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6 md:p-10">
            <AddListingForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
