'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface TelemetryPayload {
  searchQuery?: string;
  city?: string;
  listingId?: string;
  listingSlug?: string;
  ctaName?: string;
  filterName?: string;
  filterValue?: string;
  durationSec?: number;
  rating?: number;
  referrer?: string;
  [key: string]: any;
}

interface TelemetryContextType {
  trackEvent: (eventType: string, payload?: TelemetryPayload) => void;
  sessionId: string;
}

const TelemetryContext = createContext<TelemetryContextType>({
  trackEvent: () => {},
  sessionId: '',
});

export const useTelemetry = () => useContext(TelemetryContext);

function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let sid = sessionStorage.getItem('tiffin_sid');
    if (!sid) {
      sid = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 's_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      sessionStorage.setItem('tiffin_sid', sid);
    }
    return sid;
  } catch {
    return 's_fallback';
  }
}

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionIdRef = useRef<string>('');
  const startTimeRef = useRef<number>(Date.now());
  const lastPathnameRef = useRef<string>('');

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  const sendEvent = (eventType: string, payload: TelemetryPayload = {}, useBeacon = false) => {
    const targetPath = payload.pathname || pathname || '/';
    if (targetPath.startsWith('/admin') || targetPath.startsWith('/api')) {
      return;
    }

    if (!sessionIdRef.current) {
      sessionIdRef.current = getOrCreateSessionId();
    }

    const eventData = {
      sessionId: sessionIdRef.current,
      eventType,
      pathname: targetPath,
      deviceType: getDeviceType(),
      referrer: payload.referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
      ...payload,
    };

    if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(eventData)], { type: 'application/json' });
        navigator.sendBeacon('/api/telemetry', blob);
        return;
      } catch {
        // Fallback to fetch
      }
    }

    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
      keepalive: true,
    }).catch(() => {});
  };

  const trackEvent = (eventType: string, payload: TelemetryPayload = {}) => {
    sendEvent(eventType, payload, false);
  };

  // Route change: Track PAGE_VIEW and calculate TIME_SPENT for previous page
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return;
    }

    const currentPath = pathname + (searchParams?.toString() ? '?' + searchParams.toString() : '');

    // Track TIME_SPENT on previous page
    if (lastPathnameRef.current && lastPathnameRef.current !== currentPath && !lastPathnameRef.current.startsWith('/admin')) {
      const elapsedSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      sendEvent('TIME_SPENT', {
        pathname: lastPathnameRef.current,
        durationSec: elapsedSec,
      }, true);
    }

    // Reset timer & update lastPathname
    startTimeRef.current = Date.now();
    lastPathnameRef.current = currentPath;

    // Extract listing slug from detail page paths like /tiffin/some-slug
    const slugMatch = pathname.match(/^\/tiffin\/([^/]+)$/);
    const listingSlug = slugMatch ? slugMatch[1] : undefined;

    // Track PAGE_VIEW for current page
    const city = searchParams?.get('city') || undefined;
    const q = searchParams?.get('q') || undefined;

    sendEvent('PAGE_VIEW', {
      city: city || q,
      searchQuery: q,
      listingSlug,
    });
  }, [pathname, searchParams?.toString()]);

  // Track TIME_SPENT on window unload / tab hide
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && lastPathnameRef.current && !lastPathnameRef.current.startsWith('/admin')) {
        const elapsedSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        sendEvent('TIME_SPENT', {
          pathname: lastPathnameRef.current,
          durationSec: elapsedSec,
        }, true);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <TelemetryContext.Provider value={{ trackEvent, sessionId: sessionIdRef.current }}>
      {children}
    </TelemetryContext.Provider>
  );
}
