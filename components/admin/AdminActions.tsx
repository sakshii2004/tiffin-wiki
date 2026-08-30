'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Trash2, Loader2 } from 'lucide-react';

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
    <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]" aria-label="Admin actions">
      <h2 className="font-semibold text-body">Admin Actions</h2>

      {deleteMode ? (
        <div className="space-y-3 rounded-xl border border-red-200 bg-red-50/50 p-4">
          <p className="text-sm font-bold text-red-700">
            Are you sure you want to delete this listing?
          </p>
          <p className="text-xs text-red-600 leading-relaxed">
            This will permanently erase all associated data including reviews, offerings, and images.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              Confirm Delete
            </button>
            <button
              type="button"
              onClick={() => setDeleteMode(false)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : !rejectMode ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={loading || currentStatus === 'APPROVED'}
              aria-disabled={loading || currentStatus === 'APPROVED'}
              className="flex-1"
            >
              {currentStatus === 'APPROVED' ? 'Already Approved' : 'Approve'}
            </Button>
            {currentStatus !== 'APPROVED' && (
              <Button
                variant="danger"
                onClick={() => setRejectMode(true)}
                disabled={loading || currentStatus === 'REJECTED'}
                aria-disabled={loading || currentStatus === 'REJECTED'}
                className="flex-1"
              >
                {currentStatus === 'REJECTED' ? 'Already Rejected' : 'Reject'}
              </Button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDeleteMode(true)}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            Delete Listing Permanently
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <Textarea
            label="Rejection reason (required)"
            name="adminNote"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            maxLength={800}
          />
          <div className="flex gap-3">
            <Button variant="danger" onClick={handleReject} disabled={loading}>
              Confirm Rejection
            </Button>
            <Button variant="ghost" onClick={() => setRejectMode(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
