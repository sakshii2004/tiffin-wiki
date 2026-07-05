import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

/**
 * Admin identity model (build_spec Section 4.7):
 * There is no AdminUser table. Admin access is determined entirely at runtime
 * by comparing `session.user.email` to `process.env.ADMIN_EMAIL`. This check is
 * performed in middleware (edge), the admin layout (server), and each admin API
 * route (API layer) — three independent enforcement points. Do not introduce an
 * AdminUser table or move this check into the database.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: {
    // Database strategy: sessions stored in PostgreSQL via PrismaAdapter.
    // This means sessions are revocable and tied to the User record.
    strategy: 'database',
  },
  callbacks: {
    /**
     * Attach user.id to every session object.
     * Required so server components and API routes can identify the user
     * without a separate database lookup after receiving the session.
     */
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
