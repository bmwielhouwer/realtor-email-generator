"use client";

import { useState, type ReactNode } from "react";
import EmailGenerator from "./EmailGenerator";
import ListingDescriptionGenerator from "./ListingDescriptionGenerator";

type Tool = "cold-email" | "listing";

export default function ToolTabs() {
  const [tool, setTool] = useState<Tool>("cold-email");

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-[0_15px_40px_-15px_rgba(27,36,71,0.18)]">
        <nav className="flex" role="tablist" aria-label="Generator tools">
          <TabButton
            active={tool === "cold-email"}
            onClick={() => setTool("cold-email")}
          >
            <span className="hidden sm:inline">Cold Email Generator</span>
            <span className="sm:hidden">Cold Emails</span>
          </TabButton>
          <div
            aria-hidden
            className="my-3.5 w-px self-center bg-navy/10 sm:my-4"
          />
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
      className={`group relative flex-1 px-4 py-5 text-[11px] font-semibold uppercase tracking-[0.2em] leading-tight transition-colors duration-150 focus:outline-none focus-visible:bg-gold/5 sm:px-6 sm:text-xs sm:tracking-[0.22em] ${
        active ? "text-navy" : "text-silver hover:text-navy"
      }`}
    >
      <span className="block">{children}</span>
      <span
        aria-hidden
        className={`absolute inset-x-4 bottom-0 h-[2px] rounded-full transition-all duration-200 sm:inset-x-6 ${
          active ? "bg-gold" : "bg-transparent group-hover:bg-navy/15"
        }`}
      />
    </button>
  );
}
