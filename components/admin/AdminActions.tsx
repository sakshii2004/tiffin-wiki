'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface AdminActionsProps {
  listingId: string;
  currentStatus: string;
  currentAdminNote: string;
}

export function AdminActions({ listingId, currentStatus, currentAdminNote }: AdminActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [rejectMode, setRejectMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [adminNote, setAdminNote] = useState(currentAdminNote);
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    const res = await fetch(`/api/listings/${listingId}/approve`, { method: 'POST' });
    setLoading(false);
    if (res.ok) {
      showToast('Listing approved and is now live.', 'success');
      router.push('/admin');
    } else {
      showToast('Failed to approve. Please try again.', 'error');
    }
  }

  async function handleReject() {
    if (!adminNote.trim()) {
      showToast('A rejection reason is required.', 'error');
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/listings/${listingId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNote }),
    });
    setLoading(false);
    if (res.ok) {
      showToast('Listing rejected.', 'success');
      router.push('/admin');
    } else {
      showToast('Failed to reject. Please try again.', 'error');
    }
  }

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/listings/${listingId}`, { method: 'DELETE' });
    setLoading(false);
    if (res.ok) {
      showToast('Listing permanently deleted.', 'success');
      router.push('/admin');
    } else {
      showToast('Failed to delete listing. Please try again.', 'error');
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-5 backdrop-blur-md shadow-md font-sans text-slate-100" aria-label="Admin actions">
      <h2 className="font-mono font-bold text-xs uppercase tracking-wider text-emerald-400">Admin Operations</h2>

      {deleteMode ? (
        <div className="space-y-3 rounded-xl border border-red-500/30 bg-red-950/40 p-4 font-mono">
          <p className="text-xs font-bold text-red-400">
            Confirm permanent deletion of this listing?
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            This will permanently erase all associated data including reviews, offerings, and images.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              Confirm Delete
            </button>
            <button
              type="button"
              onClick={() => setDeleteMode(false)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : !rejectMode ? (
        <div className="flex flex-col gap-2.5 font-mono">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleApprove}
              disabled={loading || currentStatus === 'APPROVED'}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-40 transition-colors cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <CheckCircle2 size={14} />
              {currentStatus === 'APPROVED' ? 'Already Approved' : 'Approve'}
            </button>

            {currentStatus !== 'APPROVED' && (
              <button
                type="button"
                onClick={() => setRejectMode(true)}
                disabled={loading || currentStatus === 'REJECTED'}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <XCircle size={14} />
                {currentStatus === 'REJECTED' ? 'Already Rejected' : 'Reject'}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDeleteMode(true)}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            Delete Listing Permanently
          </button>
        </div>
      ) : (
        <div className="space-y-3 font-mono">
          <div className="space-y-1">
            <label className="text-xs text-amber-300 font-semibold">Rejection reason (required)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              maxLength={800}
              rows={3}
              className="w-full rounded-xl border border-amber-500/30 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
            >
              Confirm Rejection
            </button>
            <button
              type="button"
              onClick={() => setRejectMode(false)}
              disabled={loading}
              className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
