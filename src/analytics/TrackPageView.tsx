import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "./ga";

export function TrackPageView() {
  const location = useLocation();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    const pageKey = `${location.pathname}${location.search}${location.hash}`;

    // Avoid duplicate events:
    // 1) GA snippet auto-sends a page_view on initial load.
    // 2) React 18 StrictMode can remount in dev.
    try {
      const skipInitialKey = "__ga_skip_initial_page_view";
      const lastKey = "__ga_last_page";

      // Skip the very first effect run; the initial page_view has already been sent by GA.
      const hasSkipped = window.sessionStorage.getItem(skipInitialKey);
      if (!hasSkipped) {
        window.sessionStorage.setItem(skipInitialKey, "1");
        window.sessionStorage.setItem(lastKey, pageKey);
        return;
      }

      const storageKey = "__ga_last_page";
      const last = window.sessionStorage.getItem(storageKey);
      if (last === pageKey) return;
      window.sessionStorage.setItem(storageKey, pageKey);
    } catch {
      // Ignore storage issues (e.g. privacy mode).
    }

    if (lastTrackedRef.current === pageKey) return;
    lastTrackedRef.current = pageKey;

    trackPageView(pageKey);
  }, [location]);

  return null;
}

