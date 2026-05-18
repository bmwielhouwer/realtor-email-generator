"use client";

import { useState } from "react";

type OutputCardProps = {
  eyebrow: string;
  heading: string;
  body: string;
  copyText?: string;
};

export default function OutputCard({
  eyebrow,
  heading,
  body,
  copyText,
}: OutputCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText ?? body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable; intentionally swallow.
    }
  };

  return (
    <article className="relative overflow-hidden rounded-xl border border-silver/20 bg-white pl-6 pr-6 py-6 shadow-sm transition-all duration-200 hover:shadow-lg sm:pl-8 sm:pr-8 sm:py-7">
      <div className="absolute left-0 top-0 h-full w-1 bg-gold" aria-hidden />
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            {eyebrow}
          </div>
          <h3 className="mt-1.5 font-serif text-lg font-bold text-navy sm:text-xl">
            {heading}
          </h3>
        </div>
        <button onClick={handleCopy} className="btn-secondary shrink-0">
          {copied ? (
            <>
              <CheckIcon /> Copied
            </>
          ) : (
            <>
              <CopyIcon /> Copy
            </>
          )}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy/85">
        {body}
      </p>
    </article>
  );
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
