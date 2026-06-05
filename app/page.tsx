import ToolTabs from "./ToolTabs";

const STRIPE_FOUNDING_URL = "https://buy.stripe.com/00w6oA8qI4smaNo2kc9AA0d";

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
              Agent Marketing Autopilot
            </span>
            <a
              href={STRIPE_FOUNDING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:ring-offset-2 focus:ring-offset-navy"
            >
              Start Free Trial
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
            Agent Marketing Autopilot
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-silver sm:text-lg">
            Listing descriptions, social posts, follow-up sequences, and
            just-listed/just-sold content &mdash; written for real estate, not
            generic AI.
          </p>
          <div className="mx-auto mt-10 h-px w-20 bg-gold" />

          <div className="mx-auto mt-12 max-w-md">
            <FoundingMemberCard ctaHref={STRIPE_FOUNDING_URL} />
          </div>

          <p className="mt-8 text-xs text-silver">
            14-day free trial &middot; No charge today &middot; Access code delivered instantly &middot; Cancel anytime.
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

const FEATURES = [
  "Listing descriptions that don't sound like every other agent's",
  "Social media captions ready to post for Instagram, Facebook, LinkedIn",
  "Follow-up email sequences for buyers, sellers, and cold leads",
];

function FoundingMemberCard({ ctaHref }: { ctaHref: string }) {
  return (
    <div className="relative flex flex-col rounded-2xl border-2 border-gold bg-white p-7 text-left shadow-[0_25px_60px_-15px_rgba(184,149,42,0.45)] sm:p-8">
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm">
        Founding Member
      </span>
      <div className="text-center">
        <div className="flex items-baseline justify-center">
          <span className="font-serif text-5xl font-bold text-navy">$29</span>
          <span className="ml-1 text-sm text-silver-dark">/mo</span>
        </div>
        <p className="mt-3 text-sm font-semibold text-gold">
          For your first 6 months. Then $49/mo.
        </p>
        <p className="mt-2 text-xs font-medium text-navy">Free for 14 days &middot; $0 today</p>
        <p className="mt-1 text-xs text-silver-dark">
          Limited to the first 25 agents.
        </p>
      </div>

      <ul className="mt-7 space-y-3 border-t border-silver/40 pt-6">
        {FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm leading-relaxed text-silver-dark">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-7 inline-flex items-center justify-center rounded-lg bg-gold px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:ring-offset-2"
      >
        Start Free Trial
      </a>
    </div>
  );
}
