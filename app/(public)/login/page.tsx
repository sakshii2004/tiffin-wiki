import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Sign in',
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;

  async function handleGoogleSignIn() {
    'use server';
    await signIn('google', { redirectTo: callbackUrl ?? '/' });
  }

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4"
    >
      {/* Dot-grid background — identical to homepage hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(rgba(106, 163, 55, 0.3) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)',
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-[#e2e8f0] bg-white/95 backdrop-blur-sm p-8 shadow-soft-lg flex flex-col items-center gap-6">
        {/* Logo */}
        <Link href="/" aria-label="Tiffin Wiki — home">
          <Image
            src="/tiffin-wiki-logo.png"
            alt="Tiffin Wiki"
            width={148}
            height={38}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a] leading-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-[#475569] leading-relaxed">
            Sign in to leave reviews and track your favourite tiffin services.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#e2e8f0]" aria-hidden="true" />

        {/* Google sign-in */}
        <form action={handleGoogleSignIn} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 rounded-full border border-[#e2e8f0] bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] shadow-sm transition-all hover:bg-[#f8fafc] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b85c38]"
          >
            {/* Google logo */}
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615Z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18Z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9573A8.9961 8.9961 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71Z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795Z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </form>

        {/* Back link */}
        <p className="text-xs text-[#94a3b8]">
          <Link href="/" className="hover:text-[#475569] transition-colors underline underline-offset-2">
            ← Back to tiffin.wiki
          </Link>
        </p>
      </div>
    </main>
  );
}
