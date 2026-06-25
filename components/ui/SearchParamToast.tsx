'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';

export function SearchParamToast({
  param,
  message,
  type,
}: {
  param: string | undefined;
  message: string;
  type: 'success' | 'error';
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const shown = useRef(false);

  useEffect(() => {
    // StrictMode double-invokes effects in dev; the ref guarantees one toast.
    if (param && !shown.current) {
      shown.current = true;
      showToast(message, type);
      // Remove the param from the URL so the toast does not re-fire on remount
      // or browser back-navigation. scroll:false keeps the scroll position.
      router.replace(window.location.pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
