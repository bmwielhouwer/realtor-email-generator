"use client";

import { useEffect, useState, type FormEvent } from "react";
import OutputCard from "./OutputCard";

type BuyerType = "first_time" | "luxury" | "investor" | "family";

type GeneratedOutput = {
  kind: "mls" | "social" | "email" | "text";
  title: string;
  body: string;
};

type FormState = {
  agentName: string;
  propertyAddress: string;
  cityState: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  yearBuilt: string;
  features: string;
  neighborhood: string;
  buyerType: BuyerType;
  accessCode: string;
};

const initialForm: FormState = {
  agentName: "",
  propertyAddress: "",
  cityState: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  yearBuilt: "",
  features: "",
  neighborhood: "",
  buyerType: "first_time",
  accessCode: "",
};

const ACCESS_CODE_STORAGE_KEY = "clv_access_code";

export default function ListingDescriptionGenerator() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<GeneratedOutput[]>([]);

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
    setOutputs([]);

    try {
      const response = await fetch("/api/listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to generate listing content.");
      }

      try {
        window.localStorage.setItem(ACCESS_CODE_STORAGE_KEY, form.accessCode.trim());
      } catch {
        // localStorage unavailable; ignore.
      }

      setOutputs(data.outputs ?? []);
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
            Tell us about the property
          </h2>
          <p className="mt-2 text-sm text-silver-dark">
            We&apos;ll craft four polished marketing pieces tailored to your buyer.
          </p>
        </div>

        <div className="mb-6 rounded-lg border border-gold/30 bg-gold/5 p-4">
          <label htmlFor="listingAccessCode" className="field-label !text-navy">
            Subscriber access code
          </label>
          <input
            id="listingAccessCode"
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
            <label htmlFor="agentName" className="field-label">
              Agent name
            </label>
            <input
              id="agentName"
              type="text"
              required
              value={form.agentName}
              onChange={(e) => updateField("agentName", e.target.value)}
              placeholder="Jane Doe"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="propertyAddress" className="field-label">
              Property address
            </label>
            <input
              id="propertyAddress"
              type="text"
              required
              value={form.propertyAddress}
              onChange={(e) => updateField("propertyAddress", e.target.value)}
              placeholder="123 Oak Lane"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="cityState" className="field-label">
              City &amp; state
            </label>
            <input
              id="cityState"
              type="text"
              required
              value={form.cityState}
              onChange={(e) => updateField("cityState", e.target.value)}
              placeholder="Austin, TX"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="buyerType" className="field-label">
              Target buyer type
            </label>
            <select
              id="buyerType"
              required
              value={form.buyerType}
              onChange={(e) =>
                updateField("buyerType", e.target.value as BuyerType)
              }
              className="field-input"
            >
              <option value="first_time">First-time buyer</option>
              <option value="luxury">Luxury buyer</option>
              <option value="investor">Investor</option>
              <option value="family">Family</option>
            </select>
          </div>

          <div>
            <label htmlFor="bedrooms" className="field-label">
              Bedrooms
            </label>
            <input
              id="bedrooms"
              type="number"
              required
              min={0}
              step={1}
              value={form.bedrooms}
              onChange={(e) => updateField("bedrooms", e.target.value)}
              placeholder="4"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="bathrooms" className="field-label">
              Bathrooms
            </label>
            <input
              id="bathrooms"
              type="number"
              required
              min={0}
              step={0.5}
              value={form.bathrooms}
              onChange={(e) => updateField("bathrooms", e.target.value)}
              placeholder="2.5"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="sqft" className="field-label">
              Square footage
            </label>
            <input
              id="sqft"
              type="number"
              required
              min={0}
              step={1}
              value={form.sqft}
              onChange={(e) => updateField("sqft", e.target.value)}
              placeholder="2400"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="yearBuilt" className="field-label">
              Year built
            </label>
            <input
              id="yearBuilt"
              type="number"
              required
              min={1700}
              max={new Date().getFullYear() + 1}
              step={1}
              value={form.yearBuilt}
              onChange={(e) => updateField("yearBuilt", e.target.value)}
              placeholder="2015"
              className="field-input"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="features" className="field-label">
              Key features and upgrades
            </label>
            <textarea
              id="features"
              required
              rows={3}
              value={form.features}
              onChange={(e) => updateField("features", e.target.value)}
              placeholder="Chef's kitchen with quartz counters, primary suite with spa bath, new roof (2023), three-car garage, smart-home wiring."
              className="field-input resize-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="neighborhood" className="field-label">
              Neighborhood highlights
            </label>
            <textarea
              id="neighborhood"
              required
              rows={3}
              value={form.neighborhood}
              onChange={(e) => updateField("neighborhood", e.target.value)}
              placeholder="Walk to top-rated elementary, blocks from downtown shops and the greenbelt trail, low-traffic cul-de-sac."
              className="field-input resize-none"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-silver/20 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-silver-dark">
            4 ready-to-publish pieces &middot; Generated in seconds
          </p>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              <>Generate Listing Content</>
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

      {outputs.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Step 2
              </div>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy sm:text-3xl">
                Your Listing Content
              </h2>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-silver-dark">
              {outputs.length} generated
            </span>
          </div>
          <div className="grid gap-4">
            {outputs.map((output, idx) => (
              <OutputCard
                key={idx}
                eyebrow={`Output ${idx + 1}`}
                heading={output.title}
                body={output.body}
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
