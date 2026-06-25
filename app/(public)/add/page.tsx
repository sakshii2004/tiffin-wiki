import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AddListingForm } from "@/components/forms/AddListingForm";

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
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <h1 className="mb-2 text-3xl font-bold text-body">Add a tiffin service</h1>
          <p className="mb-8 text-gray-600">
            Know a great tiffin service? List it for free. Our team reviews every
            submission.
          </p>
          <AddListingForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
