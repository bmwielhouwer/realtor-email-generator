import ToolTabs from "./ToolTabs";

const STRIPE_COLD_EMAIL_URL = "https://buy.stripe.com/dRm00c7mEbUOg7Ie2U9AA00";
const STRIPE_LISTING_URL = "https://buy.stripe.com/6oU3coeP6aQK3kW2kc9AA06";
const STRIPE_SUITE_URL = "https://buy.stripe.com/8x24gs4as0c6g7I6As9AA07";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="bg-navy">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Compass Line Ventures"
              className="h-10 w-auto"
            />
          </a>
          <div className="flex items-center gap-5">
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.25em] text-silver md:block">
              Realtor Toolkit
            </span>
            <a
              href={STRIPE_COLD_EMAIL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:ring-offset-2 focus:ring-offset-navy"
            >
              Subscribe
            </a>
          </div>
        </div>
      </header>

      <section className="bg-navy">
        <div className="mx-auto max-w-5xl px-6 pb-24 pt-16 text-center sm:pb-28 sm:pt-20">
          <img
            src="/logo.png"
            alt="Compass Line Ventures"
            className="mx-auto mb-10 h-24 w-auto sm:h-32"
          />
          <h1 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
            Marketing Content for Realtors in Seconds
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-silver sm:text-lg">
            Cold outreach emails and full listing marketing packages &mdash;
            built exclusively for real estate professionals.
          </p>
          <div className="mx-auto mt-10 h-px w-20 bg-gold" />

          <div className="mt-12 grid grid-cols-1 gap-5 text-left sm:grid-cols-3 sm:gap-5">
            <PlanCard
              name="Cold Email Pro"
              price="$200"
              description="Five tailored cold outreach emails on demand, calibrated to your market and audience."
              accent={
                <>
                  $50 first month with{" "}
                  <span className="font-mono tracking-wider">TRY25</span>
                </>
              }
              ctaHref={STRIPE_COLD_EMAIL_URL}
            />
            <PlanCard
              name="The Suite"
              price="$299"
              description="Both tools, one subscription. Cold emails plus full listing marketing whenever you need them."
              accent="Save $101/mo vs subscribing separately"
              ctaHref={STRIPE_SUITE_URL}
              highlight
            />
            <PlanCard
              name="Listing Pro"
              price="$200"
              description="MLS description, social caption, buyer email, and SMS for any listing &mdash; tuned to the target buyer."
              ctaHref={STRIPE_LISTING_URL}
            />
          </div>

          <p className="mt-8 text-xs text-silver">
            Cancel anytime &middot; Access code delivered by email after subscribing.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto -mt-16 max-w-4xl px-6 pb-24 sm:-mt-20">
          <ToolTabs />
        </div>
      </section>

      <footer className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Compass Line Ventures"
              className="h-9 w-auto"
            />
          </div>
          <div className="text-center text-xs text-silver sm:text-right">
            <div className="font-semibold uppercase tracking-[0.2em] text-white">
              Compass Line Ventures
            </div>
            <div className="mt-1">
              &copy; {new Date().getFullYear()} All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PlanCard({
  name,
  price,
  description,
  accent,
  ctaHref,
  highlight = false,
}: {
  name: string;
  price: string;
  description: React.ReactNode;
  accent?: React.ReactNode;
  ctaHref: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl bg-white p-6 sm:p-7 ${
        highlight
          ? "border-2 border-gold shadow-[0_25px_60px_-15px_rgba(184,149,42,0.45)] sm:-translate-y-2"
          : "border border-white/15 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.35)]"
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm">
          Best Value
        </span>
      )}
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        {name}
      </div>
      <div className="mt-3 flex items-baseline">
        <span className="font-serif text-4xl font-bold text-navy">{price}</span>
        <span className="ml-1 text-sm text-silver-dark">/mo</span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-silver-dark">
        {description}
      </p>
      {accent && (
        <p className="mt-3 text-xs font-semibold text-gold">{accent}</p>
      )}
      <div className="mt-6 flex-1" aria-hidden />
      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:ring-offset-2 ${
          highlight
            ? "bg-gold text-white shadow-sm hover:bg-gold-600"
            : "border-2 border-navy bg-white text-navy hover:bg-navy hover:text-white"
        }`}
      >
        Subscribe
      </a>
    </div>
  );
}
