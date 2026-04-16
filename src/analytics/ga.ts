const GA_MEASUREMENT_ID = "G-0R3MK7SW79";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type GaParams = Record<string, string | number | boolean | null | undefined>;

function getGtag(): ((...args: unknown[]) => void) | undefined {
  if (typeof window === "undefined") return undefined;
  if (typeof window.gtag !== "function") return undefined;
  return window.gtag;
}

export function trackEvent(eventName: string, params?: GaParams): void {
  const gtag = getGtag();
  if (!gtag) return;
  gtag("event", eventName, params ?? {});
}

export function trackPageView(pagePath: string): void {
  if (typeof window === "undefined") return;
  const gtag = getGtag();
  if (!gtag) return;

  gtag("config", GA_MEASUREMENT_ID, {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
    // Ensures GA4 treats this as a page view for SPA navigation.
    send_page_view: true,
  });
}

