import React from "react";
import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL("https://tiffin.wiki"),
  title: {
    default: "tiffin.wiki — Find tiffin services near you",
    template: "%s | tiffin.wiki",
  },
  description:
    "Community directory of home-style tiffin meal delivery services across India. Discover, review, and contact verified local vendors.",
  keywords: [
    "tiffin service",
    "dabba service",
    "home cooked food delivery",
    "tiffin delivery India",
    "veg tiffin",
    "lunch box delivery",
    "daily meal delivery",
    "mumbai tiffin",
    "bangalore tiffin",
    "pune tiffin",
    "delhi tiffin",
  ],
  authors: [{ name: "tiffin.wiki Community" }],
  creator: "tiffin.wiki",
  publisher: "tiffin.wiki",
  formatDetection: {
    telephone: true,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://tiffin.wiki",
    siteName: "tiffin.wiki",
    title: "tiffin.wiki — Find tiffin services near you",
    description:
      "Community directory of home-style tiffin meal delivery services across India.",
    images: [
      {
        url: "/tiffin-wiki-logo.png",
        width: 1200,
        height: 630,
        alt: "tiffin.wiki — Find home-style tiffin services near you",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "tiffin.wiki — Find tiffin services near you",
    description:
      "Community directory of home-style tiffin meal delivery services across India.",
    images: ["/tiffin-wiki-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#c44d2b",
  width: "device-width",
  initialScale: 1,
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
