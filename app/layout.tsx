import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { TelemetryProvider } from "@/components/providers/TelemetryProvider";

// Geometric, clean, professional sans-serif (design system). Never cursive.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tiffin Wiki",
    template: "%s | Tiffin Wiki",
  },
  description: "Discover and review tiffin services near you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-cream text-body antialiased">
        {/* Skip-to-content link for keyboard / screen-reader users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {/*
          SessionProviderWrapper supplies the NextAuth client session context.
          NOTE: No <main> is rendered here — each route group owns its own
          landmark (app/(public)/layout.tsx renders <main id="main-content">,
          app/admin/layout.tsx renders its content under id="main-content").
          Do not add a <main> here; it would create a duplicate landmark.
          ToastProvider supplies the global toast notification context.
        */}
        <SessionProviderWrapper>
          <ToastProvider>
            <React.Suspense fallback={null}>
              <TelemetryProvider>{children}</TelemetryProvider>
            </React.Suspense>
          </ToastProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
