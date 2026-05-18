"use client";

import { useState, type FormEvent } from "react";

type Audience = "sellers" | "buyers" | "both";

type GeneratedEmail = {
  subject: string;
  body: string;
};

type FormState = {
  name: string;
  location: string;
  audience: Audience;
  uniqueSellingPoint: string;
  callToAction: string;
};

const initialForm: FormState = {
  name: "",
  location: "",
  audience: "sellers",
  uniqueSellingPoint: "",
  callToAction: "",
};

export default function EmailGenerator() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emails, setEmails] = useState<GeneratedEmail[]>([]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setEmails([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to generate emails.");
      }

      setEmails(data.emails ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-navy-100 bg-white p-6 shadow-xl shadow-navy-900/10 sm:p-8"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="field-label">
              Your name
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Jane Doe"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="location" className="field-label">
              City &amp; state
            </label>
            <input
              id="location"
              type="text"
              required
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="Austin, TX"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="audience" className="field-label">
              Target audience
            </label>
            <select
              id="audience"
              required
              value={form.audience}
              onChange={(e) => updateField("audience", e.target.value as Audience)}
              className="field-input"
            >
              <option value="sellers">Home sellers</option>
              <option value="buyers">Home buyers</option>
              <option value="both">Both sellers and buyers</option>
            </select>
          </div>

          <div>
            <label htmlFor="cta" className="field-label">
              Call to action
            </label>
            <input
              id="cta"
              type="text"
              required
              value={form.callToAction}
              onChange={(e) => updateField("callToAction", e.target.value)}
              placeholder="Book a free 15-minute consultation"
              className="field-input"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="usp" className="field-label">
              Your unique selling point
            </label>
            <textarea
              id="usp"
              required
              rows={3}
              value={form.uniqueSellingPoint}
              onChange={(e) => updateField("uniqueSellingPoint", e.target.value)}
              placeholder="15 years specializing in downtown condos with a 98% list-to-sale price ratio."
              className="field-input resize-none"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-navy-600">
            We&apos;ll generate 5 tailored cold emails you can copy and send.
          </p>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              <>Generate emails</>
            )}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}
      </form>

      {emails.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-navy-900">Your emails</h2>
          <div className="grid gap-4">
            {emails.map((email, idx) => (
              <EmailCard key={idx} index={idx + 1} email={email} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmailCard({ index, email }: { index: number; email: GeneratedEmail }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `Subject: ${email.subject}\n\n${email.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable; intentionally swallow.
    }
  };

  return (
    <article className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-widest text-navy-500">
            Email {index}
          </div>
          <h3 className="mt-1 text-base font-bold text-navy-900">
            {email.subject}
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
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-800">
        {email.body}
      </p>
    </article>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-white"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
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
