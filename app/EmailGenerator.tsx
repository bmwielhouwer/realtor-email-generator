"use client";

import { useEffect, useState, type FormEvent } from "react";
import OutputCard from "./OutputCard";

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
  accessCode: string;
};

const initialForm: FormState = {
  name: "",
  location: "",
  audience: "sellers",
  uniqueSellingPoint: "",
  callToAction: "",
  accessCode: "",
};

const ACCESS_CODE_STORAGE_KEY = "clv_access_code";

export default function EmailGenerator() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emails, setEmails] = useState<GeneratedEmail[]>([]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ACCESS_CODE_STORAGE_KEY);
      if (saved) setForm((prev) => ({ ...prev, accessCode: saved }));
    } catch {
      // localStorage unavailable; ignore.
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setEmails([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to generate emails.");
      }

      try {
        window.localStorage.setItem(ACCESS_CODE_STORAGE_KEY, form.accessCode.trim());
      } catch {
        // localStorage unavailable; ignore.
      }

      setEmails(data.emails ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_25px_60px_-15px_rgba(27,36,71,0.25)] sm:p-10"
      >
        <div className="mb-8 border-b border-silver/20 pb-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Step 1
          </div>
          <h2 className="mt-2 font-serif text-2xl font-bold text-navy sm:text-3xl">
            Tell us about your business
          </h2>
          <p className="mt-2 text-sm text-silver-dark">
            We&apos;ll craft five tailored cold emails ready to send.
          </p>
        </div>

        <div className="mb-6 rounded-lg border border-gold/30 bg-gold/5 p-4">
          <label htmlFor="accessCode" className="field-label !text-navy">
            Subscriber access code
          </label>
          <input
            id="accessCode"
            type="text"
            required
            autoComplete="off"
            spellCheck={false}
            value={form.accessCode}
            onChange={(e) => updateField("accessCode", e.target.value)}
            placeholder="CLV-XXXX-XXXX"
            className="field-input font-mono tracking-wider"
          />
          <p className="mt-2 text-xs text-silver-dark">
            Don&apos;t have a code yet?{" "}
            <a
              href="https://buy.stripe.com/7sYeV6dL2bUO9Jkf6Y9AA0c"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold underline-offset-2 hover:underline"
            >
              Become a Founding Member
            </a>{" "}
            to receive yours.
          </p>
        </div>

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

        <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-silver/20 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-silver-dark">
            5 ready-to-send emails &middot; Generated in seconds
          </p>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              <>Generate Emails</>
            )}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}
      </form>

      {emails.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Step 2
              </div>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy sm:text-3xl">
                Your Emails
              </h2>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-silver-dark">
              {emails.length} generated
            </span>
          </div>
          <div className="grid gap-4">
            {emails.map((email, idx) => (
              <OutputCard
                key={idx}
                eyebrow={`Email ${idx + 1}`}
                heading={email.subject}
                body={email.body}
                copyText={`Subject: ${email.subject}\n\n${email.body}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
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
