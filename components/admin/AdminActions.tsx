'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface AdminActionsProps {
  listingId: string;
  currentStatus: string;
  currentAdminNote: string;
}

export function AdminActions({ listingId, currentStatus, currentAdminNote }: AdminActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [rejectMode, setRejectMode] = useState(false);
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

  return (
    <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
      <h2 className="font-semibold text-body">Admin Actions</h2>

      {!rejectMode ? (
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={loading || currentStatus === 'APPROVED'}
            aria-disabled={loading || currentStatus === 'APPROVED'}
          >
            {currentStatus === 'APPROVED' ? 'Already Approved' : 'Approve'}
          </Button>
          <Button
            variant="danger"
            onClick={() => setRejectMode(true)}
            disabled={loading || currentStatus === 'REJECTED'}
            aria-disabled={loading || currentStatus === 'REJECTED'}
          >
            {currentStatus === 'REJECTED' ? 'Already Rejected' : 'Reject'}
          </Button>
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
