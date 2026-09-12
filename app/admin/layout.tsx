import { auth, isAdminEmail } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect('/');
  }


  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300 antialiased flex flex-col">
      {/* Cyber Dark Admin Shell Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 border-b border-emerald-500/20 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800"
          >
            <ArrowLeft size={13} />
            <span>Public Site</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <Shield size={16} />
            </div>
            <span className="font-bold text-base tracking-tight font-mono text-white">
              tiffin<span className="text-emerald-400">.wiki</span> <span className="text-xs text-slate-400 font-normal ml-1">Admin OS</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            ● {session.user.email}
          </span>
        </div>
      </header>

      {/* Full-width container with zero restrictive max-w side margins */}
      <div id="main-content" className="w-full flex-1">
        {children}
      </div>
    </div>
  );
}
