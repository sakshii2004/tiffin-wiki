import { handlers } from '@/lib/auth';

// Export the GET and POST handlers provided by NextAuth.
// This catches all auth-related routes: sign-in, sign-out, callbacks, sessions.
export const { GET, POST } = handlers;
