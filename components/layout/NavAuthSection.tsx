'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';

/**
 * Renders the auth slice of the navbar as a Client Component so the rest of
 * SiteHeader (a Server Component) stays statically renderable.
 *
 * States:
 *  loading      — nothing rendered (avoids flash of wrong content)
 *  authenticated — "Hi, Name!" link → /profile  +  sign-out icon button
 *  unauthenticated — "Log in" link → /api/auth/signin
 */
export function NavAuthSection() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  if (status === 'authenticated' && session?.user) {
    const firstName = session.user.name?.split(' ')[0] ?? 'there';
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="text-[#64748b] font-medium text-[15px] hover:text-[#1e293b] transition-colors"
        >
          Hi, {firstName}!
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          aria-label="Sign out"
          className="flex items-center text-[#94a3b8] hover:text-[#b85c38] transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="text-[#64748b] font-medium text-[15px] hover:text-[#1e293b] transition-colors"
    >
      Log in
    </Link>
  );
}
