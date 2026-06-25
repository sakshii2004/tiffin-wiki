import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extend the built-in Session type rather than replacing it.
   * Using `DefaultSession['user'] &` preserves all fields NextAuth adds
   * to the user object (name, email, image) so future library additions
   * do not cause type conflicts.
   */
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
    };
  }
}
