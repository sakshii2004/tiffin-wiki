import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // NOTE: Using `auth` from lib/auth.ts as the middleware wrapper causes NextAuth
  // to perform a database session lookup on every request matching the pattern.
  // This is intentional and acceptable on Vercel serverless (Neon handles pooled
  // connections efficiently). Do NOT switch to the JWT strategy to avoid this
  // database call — the database strategy is required for session revocability
  // (signing out invalidates the session row; JWT tokens cannot be revoked before expiry).

  // Protect all /admin/* routes.
  // Two conditions must both be true to allow access:
  //   1. The request has a valid session (user is authenticated)
  //   2. The authenticated user's email matches ADMIN_EMAIL
  if (pathname.startsWith('/admin')) {
    const session = req.auth;
    const isAdmin =
      session?.user?.email &&
      session.user.email === process.env.ADMIN_EMAIL;

    if (!isAdmin) {
      // Redirect all unauthorized visitors to the homepage.
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  // Only run middleware on /admin/* paths.
  // Static files and Next.js internals are excluded automatically.
  matcher: ['/admin/:path*'],
};
