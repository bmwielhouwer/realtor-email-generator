"use client";

import { useEffect, useState, type ReactNode } from "react";
import EmailGenerator from "./EmailGenerator";
import ListingDescriptionGenerator from "./ListingDescriptionGenerator";

type Tool = "cold-email" | "listing";

// Set after a successful generation — its presence means the user has cleared
// the access-code validation gate at least once.
const ACCESS_CODE_STORAGE_KEY = "clv_access_code";

export default function ToolTabs() {
  const [tool, setTool] = useState<Tool>("cold-email");

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm">
        <nav className="flex" role="tablist" aria-label="Generator tools">
          <TabButton
            active={tool === "cold-email"}
            onClick={() => setTool("cold-email")}
          >
            <span className="hidden sm:inline">Cold Email Generator</span>
            <span className="sm:hidden">Cold Emails</span>
          </TabButton>
          <TabButton
            active={tool === "listing"}
            onClick={() => setTool("listing")}
          >
            <span className="hidden sm:inline">Listing Description Generator</span>
            <span className="sm:hidden">Listings</span>
          </TabButton>
        </nav>
      </div>

      {tool === "cold-email" ? (
        <EmailGenerator />
      ) : (
        <ListingDescriptionGenerator />
      )}

      <ManageSubscriptionLink />
    </div>
  );
}

function ManageSubscriptionLink() {
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ACCESS_CODE_STORAGE_KEY);
      if (saved && saved.trim()) setAccessCode(saved.trim());
    } catch {
      // localStorage unavailable; ignore.
    }
  }, []);

  // Only logged-in users (a validated code persisted to localStorage) see this.
  if (!accessCode) return null;

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_code: accessCode }),
      });
      const data = await response.json();
      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? "Could not open the billing portal.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1 px-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="text-sm font-semibold text-gold underline-offset-2 hover:underline disabled:opacity-50"
      >
        {loading ? "Opening…" : "Manage Subscription"}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`flex-1 px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] leading-tight transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 sm:px-4 sm:text-xs sm:tracking-[0.2em] ${
        active
          ? "bg-navy text-white shadow-inner"
          : "bg-white text-silver-dark hover:bg-navy/5 hover:text-navy"
      }`}
    >
      {children}
    </button>
  );
}
