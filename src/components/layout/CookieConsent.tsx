"use client";

import { useEffect, useState } from "react";

type Consent = {
  necessary: true;
  analytics: boolean;
  updatedAt: string; // ISO timestamp
};

const STORAGE_KEY = "kamkmserve.cookieConsent";

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    if (typeof parsed?.necessary !== "boolean") return null;
    if (typeof parsed?.analytics !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(c: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    // Expose a lightweight signal for other scripts (e.g., analytics loaders)
    if (typeof document !== "undefined") {
      document.documentElement.dataset.analyticsConsent = String(c.analytics);
      window.dispatchEvent(new CustomEvent("cookie-consent:updated", { detail: c }));
    }
  } catch {
    // ignore write errors
  }
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      setAnalytics(existing.analytics);
      // Set dataset for any conditional loaders
      document.documentElement.dataset.analyticsConsent = String(existing.analytics);
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, []);

  const acceptAll = () => {
    const c: Consent = { necessary: true, analytics: true, updatedAt: new Date().toISOString() };
    writeConsent(c);
    setAnalytics(true);
    setOpen(false);
  };

  const rejectAll = () => {
    const c: Consent = { necessary: true, analytics: false, updatedAt: new Date().toISOString() };
    writeConsent(c);
    setAnalytics(false);
    setOpen(false);
  };

  const savePrefs = () => {
    const c: Consent = { necessary: true, analytics, updatedAt: new Date().toISOString() };
    writeConsent(c);
    setOpen(false);
  };

  return (
    <>
      {/* Manage button (always visible) */}
      <button
        type="button"
        aria-label="Cookie preferences"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 rounded-full bg-neutral-800/80 px-3 py-2 text-sm text-white shadow hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        Cookie Preferences
      </button>

      {/* Banner / Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" aria-hidden="true" onClick={() => setOpen(false)} />
          <div className="relative m-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl ring-1 ring-black/10 dark:bg-neutral-900 dark:text-white">
            <h2 className="m-0 text-xl font-semibold">We value your privacy</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              We use essential cookies to make this site work. With your consent, we will also use analytics cookies to help us improve the site.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <input id="consent-necessary" type="checkbox" checked disabled className="mt-1" />
                <label htmlFor="consent-necessary" className="text-sm">
                  <span className="font-medium">Necessary</span> — required for core functionality and security.
                </label>
              </div>
              <div className="flex items-start gap-3">
                <input
                  id="consent-analytics"
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="consent-analytics" className="text-sm">
                  <span className="font-medium">Analytics</span> — helps us understand usage and improve the experience.
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={rejectAll}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Reject all
              </button>
              <button
                type="button"
                onClick={savePrefs}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Save preferences
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                Accept all
              </button>
            </div>

            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
              Read our <a href="/privacy" className="underline">Privacy Policy</a> for more details.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
