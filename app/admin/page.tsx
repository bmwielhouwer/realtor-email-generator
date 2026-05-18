"use client";

import { useState, type FormEvent } from "react";

type Plan = "cold_email" | "listing" | "both";

type CodeEntry = {
  code: string;
  email: string;
  name: string | null;
  plan: Plan;
  customerId: string | null;
  subscriptionId: string | null;
  createdAt: string;
};

const planLabel: Record<Plan, string> = {
  cold_email: "Cold Email Pro",
  listing: "Listing Pro",
  both: "The Suite",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codes, setCodes] = useState<CodeEntry[]>([]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to load codes.");
      }
      setCodes(data.codes ?? []);
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to load codes.");
      }
      setCodes(data.codes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <main className="min-h-screen bg-navy">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12">
          <div className="w-full rounded-2xl bg-white p-8 shadow-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
              Compass Line Ventures
            </div>
            <h1 className="mt-2 font-serif text-2xl font-bold text-navy">
              Admin Access
            </h1>
            <p className="mt-2 text-sm text-silver-dark">
              Enter the admin password to view active subscriber codes.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="password" className="field-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="bg-navy">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
              Compass Line Ventures
            </div>
            <h1 className="mt-1 font-serif text-xl font-bold text-white">
              Subscriber Admin
            </h1>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-bold text-navy">
            Active Subscribers
          </h2>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-silver-dark">
            {codes.length} {codes.length === 1 ? "code" : "codes"}
          </span>
        </div>

        {codes.length === 0 ? (
          <div className="rounded-xl border border-silver/20 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-silver-dark">
              No auto-provisioned codes yet. Codes appear here automatically
              when a customer subscribes via Stripe.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-silver/20 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy/[0.03]">
                <tr className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/70">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((entry) => (
                  <tr
                    key={entry.code}
                    className="border-t border-silver/15 transition-colors hover:bg-gold/5"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold tracking-wider text-navy">
                      {entry.code}
                    </td>
                    <td className="px-4 py-3 text-navy">
                      <div className="font-medium">
                        {entry.name ?? <span className="text-silver-dark">—</span>}
                      </div>
                      <div className="text-xs text-silver-dark">
                        {entry.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                          entry.plan === "both"
                            ? "bg-gold/15 text-gold-700"
                            : "bg-navy/10 text-navy"
                        }`}
                      >
                        {planLabel[entry.plan]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-silver-dark">
                      {formatDate(entry.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
