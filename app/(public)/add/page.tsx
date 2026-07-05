import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AddListingForm } from "@/components/forms/AddListingForm";

export const metadata: Metadata = {
  title: "List a tiffin service — tiffin.wiki",
  description: "Add a tiffin service to our free community directory.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://tiffin.wiki/add" },
};

function HorizontalPolaroid({ imageSrc, className = "" }: { imageSrc: string; className?: string }) {
  return (
    <div
      className={`bg-white p-4 pb-8 rounded-none border border-slate-200/85 shadow-[0_10px_24px_rgba(0,0,0,0.12)] w-full max-w-[242px] shrink-0 select-none ${className}`}
    >
      <div className="relative aspect-[4/3] w-full rounded-none overflow-hidden bg-slate-50 border border-slate-100">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="242px"
          className="object-cover rounded-none"
          priority
        />
      </div>
    </div>
  );
}

export default function AddListingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 relative z-10 pt-8 md:pt-12 pb-12 md:pb-16">

        {/* Ambient Glows clipped wrapper to prevent horizontal body overflow/scrollbar */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-[-10%] w-[350px] h-[350px] rounded-full bg-[#6aa337]/8 blur-[120px]" />
          <div className="absolute top-1/2 right-[-10%] w-[300px] h-[300px] rounded-full bg-[#b85c38]/5 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-5xl px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">

            {/* Left Info Column Wrapper (Spans full height of grid row to serve as a sticky track) */}
            <div className="md:col-span-5">
              {/* Sticky Container - h-fit prevents it from stretching to fill the parent cell height, enabling it to slide */}
              <div className="md:sticky md:top-36 flex flex-col items-center md:items-start text-center md:text-left h-fit">

                {/* Community Directory Badge */}
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold text-[#6aa337] bg-white border border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)] mb-4 uppercase tracking-wider w-fit">
                  Community Directory
                </span>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight leading-tight mb-4">
                  List a <span className="text-[#b85c38]">tiffin</span> service
                </h1>

                <p className="text-[#64748b] text-base md:text-lg mb-2 max-w-md">
                  Whether you run a tiffin service or know a great home kitchen in your area, list it for free to help locals discover wholesome home-cooked meals.
                </p>

                {/* Stacked Horizontal Polaroid Cards Mockup (Desktop only) */}
                <div className="hidden md:block relative w-full max-w-[386px] h-[275px] mt-4 select-none">
                  {/* Back shadow glow behind card stack */}
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#6aa337]/8 to-[#b85c38]/8 rounded-[24px] blur-xl opacity-20" />

                  {/* Polaroid Card 1 (Top Left — Layer 1 - bottom) */}
                  <HorizontalPolaroid
                    imageSrc="/images/polaroid-2.png"
                    className="absolute top-0 left-0 transform -rotate-6 hover:-rotate-2 transition-transform duration-500 ease-out z-0 cursor-default"
                  />

                  {/* Polaroid Card 2 (Bottom Right — Layer 2 - top, stacked on top of Card 1) */}
                  <HorizontalPolaroid
                    imageSrc="/images/polaroid-1.png"
                    className="absolute top-16 left-36 transform rotate-4 hover:rotate-8 transition-transform duration-500 ease-out z-10 cursor-default"
                  />
                </div>
              </div>
            </div>

            {/* Right Form Card Column (With min-h-[600px] to establish a sticky track in Step 1) */}
            <div className="md:col-span-7 w-full min-h-[600px] bg-white/95 backdrop-blur-[10px] rounded-3xl border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5 md:p-6 lg:p-8 z-10">
              <AddListingForm />
            </div>

          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
