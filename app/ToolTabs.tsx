"use client";

import { useState, type ReactNode } from "react";
import EmailGenerator from "./EmailGenerator";
import ListingDescriptionGenerator from "./ListingDescriptionGenerator";

type Tool = "cold-email" | "listing";

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
