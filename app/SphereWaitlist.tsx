"use client";

import { useState, type FormEvent } from "react";

export default function SphereWaitlistForm() {
  const [email, setEmail] = useState("");
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: "",
          problem,
          feature_id: "sphere-nurture",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? "Something went wrong.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-navy/10 bg-white p-8 text-center shadow-sm">
        <p className="font-serif text-xl font-bold text-navy">
          Thanks &mdash; you&apos;re on the list. We&apos;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 max-w-xl space-y-4 text-left"
    >
      <div>
        <label htmlFor="waitlist-email" className="field-label">
          Email
        </label>
        <input
          id="waitlist-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="field-input"
        />
      </div>

      <div>
        <label htmlFor="waitlist-problem" className="field-label">
          What&apos;s your biggest sphere follow-up problem right now? (optional,
          but really helpful)
        </label>
        <textarea
          id="waitlist-problem"
          rows={3}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          className="field-input resize-none"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Submitting..." : "Notify Me at Launch"}
      </button>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <p className="text-center text-xs text-silver-dark">
        No spam. We&apos;ll only email you when it launches.
      </p>
    </form>
  );
}
