'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { toTitleCase } from '@/lib/titleCase';
import { Trash2, Edit, Loader2 } from 'lucide-react';

export interface AdminListingRowProps {
  listing: {
    id: string;
    name: string;
    city: string;
    status: string;
    createdAt: Date;
  };
}

function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    APPROVED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    REJECTED: 'bg-red-500/15 text-red-300 border-red-500/30',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-bold ${
        styles[status] ?? 'bg-slate-800 text-slate-300 border-slate-700'
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function AdminListingRow({ listing }: AdminListingRowProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`Listing "${listing.name}" deleted.`, 'success');
        setShowConfirm(false);
        router.refresh();
      } else {
        showToast('Failed to delete listing. Please try again.', 'error');
      }
    } catch {
      showToast('An error occurred while deleting.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <tr className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors font-mono">
        <td className="px-4 py-3.5 text-xs text-slate-500">
          {listing.id.slice(0, 8)}…
        </td>
        <td className="px-4 py-3.5 text-sm font-semibold text-white font-sans">
          {listing.name}
        </td>
        <td className="px-4 py-3.5 text-xs text-slate-300">
          {toTitleCase(listing.city)}
        </td>
        <td className="px-4 py-3.5 text-xs">
          <StatusBadge status={listing.status} />
        </td>
        <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
          {formatDateTime(listing.createdAt)}
        </td>
        <td className="px-4 py-3.5 text-right">
          <div className="flex items-center justify-end gap-2 font-sans">
            <Link
              href={`/admin/listings/${listing.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
            >
              <Edit size={13} className="text-emerald-400" />
              Edit / Review
            </Link>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 transition-colors cursor-pointer"
              title="Delete entry"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </td>
      </tr>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-red-500/30 p-6 shadow-2xl flex flex-col gap-4 text-slate-100 font-sans">
            <div className="flex items-center gap-3 text-red-400 font-mono">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold">Delete Listing?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">{listing.name}</strong> ({toTitleCase(listing.city)})? All associated offerings, reviews, and photos will be removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                {deleting ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
