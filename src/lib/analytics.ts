/**
 * Lightweight product analytics for WhoAmI.
 *
 * Uses Vercel Web Analytics custom events when enabled on the project
 * (`window.va`). Safe no-op locally / when unavailable — no extra npm dep.
 *
 * Enable: Vercel → Project → Analytics.
 */
type Props = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    va?: (...args: unknown[]) => void;
    vaq?: unknown[];
  }
}

function cleanProps(
  props?: Props,
): Record<string, string | number | boolean> | undefined {
  if (!props) return undefined;
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined) continue;
    clean[key] = value;
  }
  return Object.keys(clean).length ? clean : undefined;
}

export function track(event: string, props?: Props): void {
  if (typeof window === "undefined") return;
  const data = cleanProps(props);
  try {
    window.va =
      window.va ||
      function (...args: unknown[]) {
        (window.vaq = window.vaq || []).push(args);
      };
    window.va("event", { name: event, ...(data ? { data } : {}) });
  } catch {
    // Never break the map for analytics.
  }
}

export function trackSearchSelect(query: string, nodeId: string): void {
  track("search_select", { query: query.slice(0, 80), nodeId });
}

export function trackNodeOpen(
  nodeId: string,
  source: "map" | "search" | "neighbor" | "next_step" | "url",
): void {
  track("node_open", { nodeId, source });
}

export function trackNextStep(fromId: string, toId: string): void {
  track("next_step", { fromId, toId });
}
