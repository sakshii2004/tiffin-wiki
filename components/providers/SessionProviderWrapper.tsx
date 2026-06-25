'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Thin Client Component wrapper so the root layout can remain a Server Component
 * while still providing the SessionProvider context to the entire tree.
 */
export function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
