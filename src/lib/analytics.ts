export type AnalyticsEvent = {
  name: string;
  props?: Record<string, unknown>;
};

let enabled = true;

export function setAnalyticsEnabled(v: boolean) {
  enabled = v;
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  if (!enabled) return;
  if (typeof window === "undefined") return;
  try {
    // Replace with your analytics provider later (GA, PostHog, Rudder, etc.)
    // For now, keep it non-breaking and observable in dev tools
    // eslint-disable-next-line no-console
    console.debug("[analytics]", { name, props });
  } catch {
    // noop
  }
}
