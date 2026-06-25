import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

// All admin pages must never be indexed (Section 12 / Task 7.3.1).
// Exported from the layout so it cascades to /admin and every /admin/* route.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Defence in depth: middleware is the primary guard.
  // This check ensures that even if middleware is misconfigured or bypassed,
  // admin pages never render for non-admin users.
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect('/');
  }

  // NOTE: The <header> below is the admin shell header — it is intentionally
  // separate from the public <SiteHeader> component and must stay that way.
  // The admin header is rendered only after the auth guard above passes;
  // merging it with SiteHeader would require threading auth logic into a
  // shared component and risks inadvertently weakening the guard. Do not
  // refactor these two headers into a single shared component.
  //
  // The inner content wrapper keeps id="main-content" so the root layout's
  // skip-to-content link resolves on admin pages (it deliberately uses a
  // non-semantic <div> rather than <main> — see app/layout.tsx).
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-black/5 px-6 py-3 flex items-center justify-between shadow-[var(--shadow-soft)]">
        <span className="font-semibold text-body">tiffin.wiki Admin</span>
        <span className="text-sm text-gray-500">{session.user.email}</span>
      </header>
      <div id="main-content" className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
