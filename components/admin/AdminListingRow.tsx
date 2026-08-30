'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { FOCUS_RING } from '@/components/ui/styles';
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
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
        styles[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'
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
      <tr className="border-b border-gray-100 hover:bg-slate-50/50 transition-colors">
        <td className="px-3 py-3 font-mono text-xs text-gray-500">
          {listing.id.slice(0, 8)}…
        </td>
        <td className="px-3 py-3 text-sm font-semibold text-body">
          {listing.name}
        </td>
        <td className="px-3 py-3 text-sm text-body">
          {toTitleCase(listing.city)}
        </td>
        <td className="px-3 py-3 text-sm">
          <StatusBadge status={listing.status} />
        </td>
        <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
          {formatDateTime(listing.createdAt)}
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/listings/${listing.id}`}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors ${FOCUS_RING}`}
            >
              <Edit size={13} />
              Edit / Review
            </Link>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors ${FOCUS_RING}`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 rounded-full bg-red-100">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Listing?</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">{listing.name}</strong> ({toTitleCase(listing.city)})? All associated offerings, reviews, and photos will be removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
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
