import type { Metadata } from 'next';
import Link from 'next/link';
import { Star, Plus } from 'lucide-react';
import { signIn, getSafeRedirectUrl } from '@/lib/auth';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: 'Sign in',
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; tab?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, tab } = await searchParams;
  const isSignUp = tab === 'signup';
  const safeCallbackUrl = getSafeRedirectUrl(callbackUrl);
  const safeCallbackParam = safeCallbackUrl !== '/' ? `callbackUrl=${encodeURIComponent(safeCallbackUrl)}` : '';

  async function handleGoogleSignIn() {
    'use server';
    await signIn('google', { redirectTo: safeCallbackUrl });
  }

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="flex-1 relative z-10 pt-8 md:pt-12 pb-12 md:pb-16"
      >
        <div className="mx-auto max-w-5xl px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">

            {/* Left auth card */}
            <div className="md:col-span-7 w-full bg-white/95 backdrop-blur-[10px] rounded-3xl border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-8 md:p-10 z-10 flex flex-col items-center gap-6">

              {/* Tab switcher */}
              <div className="flex w-full rounded-full bg-[#f1f5f9] p-1 gap-1" role="tablist">
                <Link
                  href={safeCallbackParam ? `/login?${safeCallbackParam}` : '/login'}
                  role="tab"
                  aria-selected={!isSignUp}
                  className={`flex-1 text-center rounded-full py-1.5 text-sm font-semibold transition-all ${
                    !isSignUp
                      ? 'bg-white text-[#0f172a] shadow-sm'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  href={safeCallbackParam ? `/login?tab=signup&${safeCallbackParam}` : '/login?tab=signup'}
                  role="tab"
                  aria-selected={isSignUp}
                  className={`flex-1 text-center rounded-full py-1.5 text-sm font-semibold transition-all ${
                    isSignUp
                      ? 'bg-white text-[#0f172a] shadow-sm'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  Create account
                </Link>
              </div>

              {/* Heading */}
              <div className="text-center w-full">
                <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a] leading-tight">
                  {isSignUp ? 'Join Tiffin Wiki' : 'Welcome back'}
                </h2>
                <p className="mt-1.5 text-sm text-[#475569] leading-relaxed">
                  {isSignUp
                    ? 'Create a free account to discover, review, and list tiffin services.'
                    : 'Sign in to leave reviews and track your favourite tiffin services.'}
                </p>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-[#e2e8f0]" aria-hidden="true" />

              {/* Google sign-in / sign-up */}
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
                  {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
                </button>
              </form>

              {/* Cross-link */}
              <p className="text-xs text-[#94a3b8] text-center">
                {isSignUp ? (
                  <>
                    Already have an account?{' '}
                    <Link
                      href={safeCallbackParam ? `/login?${safeCallbackParam}` : '/login'}
                      className="text-[#475569] font-medium hover:text-[#0f172a] transition-colors underline underline-offset-2"
                    >
                      Sign in
                    </Link>
                  </>
                ) : (
                  <>
                    New here?{' '}
                    <Link
                      href={safeCallbackParam ? `/login?tab=signup&${safeCallbackParam}` : '/login?tab=signup'}
                      className="text-[#475569] font-medium hover:text-[#0f172a] transition-colors underline underline-offset-2"
                    >
                      Create an account
                    </Link>
                  </>
                )}
              </p>

            </div>

            {/* Right info column */}
            <div className="md:col-span-5">
              <div className="md:sticky md:top-36 flex flex-col items-center md:items-start text-center md:text-left h-fit">
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold text-brand-peridot bg-white border border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)] mb-4 uppercase tracking-wider w-fit">
                  Free &amp; community-run
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight leading-tight mb-4">
                  Your tiffin<br />community awaits
                </h1>
                <p className="text-[#64748b] text-base md:text-lg mb-6 max-w-md">
                  Join thousands discovering wholesome home-cooked tiffin services across India.
                </p>
                <ul className="flex flex-col gap-3.5 text-sm text-[#475569]">
                  <li className="flex items-center gap-2.5">
                    <Star size={15} className="text-brand-peridot shrink-0" fill="currentColor" />
                    Leave reviews for services you&apos;ve tried
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Plus size={15} className="text-brand-peridot shrink-0" />
                    List your own tiffin service for free
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
