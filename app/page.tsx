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
        <div className="mx-auto max-w-5xl px-6 pb-24 pt-8 text-center sm:pb-28 sm:pt-10">
          <img
            src="/logo.png"
            alt="Compass Line Ventures"
            className="mx-auto mb-6 h-20 w-auto sm:h-24"
          />
          <h1 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
            Done-for-you marketing for residential agents. In 60 seconds, not
            60 minutes.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-silver sm:text-lg">
            Listings, social posts, and follow-up sequences &mdash; written for
            real estate, not generic AI. Try it free for 14 days, no charge
            today.
          </p>
          <div className="mx-auto mt-10 h-px w-20 bg-gold" />

          <div className="mx-auto mt-12 w-full max-w-[640px]">
            <p className="mb-3 text-xs text-silver">
              See it in action &mdash; 60 seconds
            </p>
            <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/NruUaSVlT7U?rel=0&modestbranding=1"
                title="See it in action"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-md">
            <FoundingMemberCard ctaHref={STRIPE_FOUNDING_URL} />
          </div>

          <p className="mt-8 text-xs text-silver">
            14-day free trial &middot; No charge today &middot; Access code delivered instantly &middot; Cancel anytime.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
              The Story
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Why I built this
            </h2>
            <p className="mt-5 text-base leading-relaxed text-silver-dark sm:text-lg">
              I&apos;m Brian &mdash; a software engineer building tools for
              industries my family has worked in for decades. My dad&apos;s been
              a yacht broker for 25 years and his biggest complaint has always
              been the same: marketing copy takes forever, and the generic AI
              tools sound like every other listing on the market. So I built him
              a tool that turns broker notes into the full marketing package in
              under a minute. The realtor version is the same idea &mdash;
              purpose-built for residential agents, no prompt engineering
              required. If it saves you an hour a listing, that&apos;s the whole
              point.
            </p>
          </div>

          <div className="my-12 h-px w-full bg-silver/40" />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
              FAQ
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Why not just use ChatGPT?
            </h2>
            <p className="mt-5 text-base leading-relaxed text-silver-dark sm:text-lg">
              You absolutely can. But ChatGPT requires you to write a fresh
              prompt every time &mdash; and writing a good real estate prompt
              takes its own learning curve. Agent Marketing Autopilot is
              pre-built for residential workflows: paste basic listing details
              once, get an MLS-ready description, three social posts formatted
              for the platforms they&apos;re going to, and a follow-up email
              sequence calibrated to a buyer&apos;s timeline &mdash; all in the
              time it takes you to write a single ChatGPT prompt. Try it free for
              14 days. If it doesn&apos;t save you serious time, cancel.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 pb-24">
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
            <div className="mt-2 flex justify-center gap-4 sm:justify-end">
              <a href="/privacy" className="hover:text-white">
                Privacy
              </a>
              <a href="/terms" className="hover:text-white">
                Terms
              </a>
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
