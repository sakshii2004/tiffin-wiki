'use client';

import type { ToastItem } from '@/components/providers/ToastProvider';
import { FOCUS_RING } from '@/components/ui/styles';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const toneStyles: Record<ToastItem['type'], string> = {
  success: 'border-green-500 bg-green-50 text-green-900',
  error: 'border-red-500 bg-red-50 text-red-900',
};

/**
 * A single toast notification. The container in ToastProvider provides
 * aria-live; each toast just renders the message and a dismiss control.
 */
export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div
      className={`pointer-events-auto flex w-80 max-w-[90vw] items-start gap-3 rounded-md border-l-4 px-4 py-3 shadow-md ${toneStyles[toast.type]}`}
    >
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className={`shrink-0 rounded p-1 text-current/70 hover:text-current ${FOCUS_RING}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
