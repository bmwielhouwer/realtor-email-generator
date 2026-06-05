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
  status: string | null;
  trial_end: string | null;
  generations_this_month: number;
  last_active: string | null;
};

type Summary = {
  total_signups: number;
  trialing_count: number;
  active_count: number;
  canceled_count: number;
  mrr_forecast_usd: number;
};

const planLabel: Record<Plan, string> = {
  cold_email: "Cold Email Pro",
  listing: "Listing Pro",
  both: "The Suite",
};

// Table sort order: surface trials first (most time-sensitive), then healthy
// actives, then at-risk past_due, then churned canceled. Unknown statuses last.
const STATUS_PRIORITY: Record<string, number> = {
  trialing: 0,
  active: 1,
  past_due: 2,
  canceled: 3,
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codes, setCodes] = useState<CodeEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const load = async () => {
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
      setSummary(data.summary ?? null);
      setLastRefreshed(new Date());
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = await load();
    if (ok) setAuthed(true);
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

  const sortedCodes = [...codes].sort((a, b) => {
    const pa = STATUS_PRIORITY[a.status ?? ""] ?? 99;
    const pb = STATUS_PRIORITY[b.status ?? ""] ?? 99;
    if (pa !== pb) return pa - pb;
    return b.createdAt.localeCompare(a.createdAt);
  });

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
            onClick={load}
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

        {summary && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <SummaryCard label="Total Signups" value={summary.total_signups} />
            <SummaryCard
              label="Trialing"
              value={summary.trialing_count}
              accent="yellow"
            />
            <SummaryCard
              label="Active"
              value={summary.active_count}
              accent="green"
            />
            <SummaryCard
              label="Canceled"
              value={summary.canceled_count}
              accent="red"
            />
            <SummaryCard
              label="MRR Forecast"
              value={`$${summary.mrr_forecast_usd.toLocaleString()}`}
              accent="gold"
            />
          </div>
        )}

        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-bold text-navy">
            Active Subscribers
          </h2>
          <div className="flex items-baseline gap-4">
            {lastRefreshed && (
              <span className="text-[11px] text-silver-dark">
                Last refreshed {formatDate(lastRefreshed.toISOString())}
              </span>
            )}
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-silver-dark">
              {codes.length} {codes.length === 1 ? "code" : "codes"}
            </span>
          </div>
        </div>

        {codes.length === 0 ? (
          <div className="rounded-xl border border-silver/20 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-silver-dark">
              No auto-provisioned codes yet. Codes appear here automatically
              when a customer subscribes via Stripe.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-silver/20 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy/[0.03]">
                <tr className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/70">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Trial Ends</th>
                  <th className="px-4 py-3">Gens / Mo</th>
                  <th className="px-4 py-3">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {sortedCodes.map((entry) => (
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
                    <td className="px-4 py-3">
                      <StatusPill status={entry.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-silver-dark">
                      {entry.status === "trialing"
                        ? formatCountdown(entry.trial_end)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-navy">
                      {entry.generations_this_month}
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

const ACCENT_STYLES: Record<string, string> = {
  navy: "text-navy",
  green: "text-green-700",
  yellow: "text-yellow-700",
  red: "text-red-700",
  gold: "text-gold",
};

function SummaryCard({
  label,
  value,
  accent = "navy",
}: {
  label: string;
  value: string | number;
  accent?: "navy" | "green" | "yellow" | "red" | "gold";
}) {
  return (
    <div className="rounded-xl border border-silver/20 bg-white p-5 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-silver-dark">
        {label}
      </div>
      <div
        className={`mt-2 font-serif text-3xl font-bold ${ACCENT_STYLES[accent]}`}
      >
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-xs text-silver-dark">—</span>;
  }
  const styles =
    status === "active"
      ? "bg-green-100 text-green-800"
      : status === "trialing"
        ? "bg-yellow-100 text-yellow-800"
        : status === "canceled" || status === "past_due"
          ? "bg-red-100 text-red-800"
          : "bg-navy/10 text-navy";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${styles}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function formatCountdown(iso: string | null): string {
  if (!iso) return "—";
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return "—";
  const diffMs = end - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days > 1) return `in ${days} days`;
  if (days === 1) return "in 1 day";
  if (days === 0) return "today";
  return "expired";
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
