"use client";

import { useEffect } from "react";

/**
 * Boots Vercel Web Analytics when the project has it enabled.
 * Safe no-op off Vercel / when the script 404s.
 */
export function AnalyticsBeacon() {
  useEffect(() => {
    const w = window as Window & {
      va?: (...args: unknown[]) => void;
      vaq?: unknown[];
    };
    // Match Vercel’s snippet so events queued before the script loads flush.
    w.va =
      w.va ||
      function (...args: unknown[]) {
        (w.vaq = w.vaq || []).push(args);
      };

    if (document.querySelector('script[data-whoami-va]')) return;

    const script = document.createElement("script");
    script.defer = true;
    script.src = "/_vercel/insights/script.js";
    script.dataset.whoamiVa = "1";
    script.onerror = () => {
      // Local / preview without Analytics — ignore.
    };
    document.head.appendChild(script);
  }, []);

  return null;
}
