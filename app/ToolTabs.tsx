"use client";

import { useState, useEffect, type ReactNode } from "react";
import EmailGenerator from "./EmailGenerator";
import ListingDescriptionGenerator from "./ListingDescriptionGenerator";

type Tool = "cold-email" | "listing";

const API_KEY_STORAGE_KEY = "anthropic_api_key";

export default function ToolTabs() {
  const [tool, setTool] = useState<Tool>("cold-email");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(API_KEY_STORAGE_KEY);
      if (saved) setApiKey(saved);
    } catch {
      // localStorage unavailable; ignore.
    }
  }, []);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    try {
      if (value) {
        window.localStorage.setItem(API_KEY_STORAGE_KEY, value);
      } else {
        window.localStorage.removeItem(API_KEY_STORAGE_KEY);
      }
    } catch {
      // localStorage unavailable; ignore.
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-navy/10 bg-white p-6 shadow-sm">
        <label htmlFor="anthropicApiKey" className="field-label !text-navy">
          Anthropic API Key
        </label>
        <input
          id="anthropicApiKey"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          placeholder="sk-ant-..."
          className="field-input font-mono"
        />
        <p className="mt-2 text-xs text-silver-dark">
          Stored only in your browser. Sent directly to our server on each
          request — never logged or persisted on our end.
        </p>
      </div>

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
        <EmailGenerator apiKey={apiKey} />
      ) : (
        <ListingDescriptionGenerator apiKey={apiKey} />
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
