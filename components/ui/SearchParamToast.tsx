'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';

interface SearchParamToastProps {
  paramName: string;
  expectedValue?: string;
  message: string;
  type: 'success' | 'error';
}

function SearchParamToastInner({
  paramName,
  expectedValue = '1',
  message,
  type,
}: SearchParamToastProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    const val = searchParams.get(paramName);
    const matches = expectedValue !== undefined ? val === expectedValue : Boolean(val);

    if (matches && !shown.current) {
      shown.current = true;
      showToast(message, type);

      // Remove the param from the URL so the toast does not re-fire
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete(paramName);
      const query = nextParams.toString();
      const nextUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }
  }, [paramName, expectedValue, message, type, searchParams, pathname, router, showToast]);

  return null;
}

export function SearchParamToast(props: SearchParamToastProps) {
  return (
    <Suspense fallback={null}>
      <SearchParamToastInner {...props} />
    </Suspense>
  );
}
