import ToolTabs from "./ToolTabs";

const STRIPE_SUBSCRIBE_URL = "https://buy.stripe.com/dRm00c7mEbUOg7Ie2U9AA00";
const STRIPE_ALL_PLANS_URL = "https://buy.stripe.com/00w3cogXebUO1cO8IA9AA05";

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
              href={STRIPE_SUBSCRIBE_URL}
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
        <div className="mx-auto max-w-4xl px-6 pb-24 pt-16 text-center sm:pb-28 sm:pt-20">
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
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-4">
              <a
                href={STRIPE_SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Cold Email Pro — $50 First Month
              </a>
              <a
                href={STRIPE_ALL_PLANS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gold bg-transparent px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-gold transition-all duration-200 hover:bg-gold hover:text-white focus:outline-none focus:ring-2 focus:ring-gold/40 focus:ring-offset-2 focus:ring-offset-navy"
              >
                Home Lister &amp; Suite Plans
              </a>
            </div>
            <p className="text-xs text-silver">
              Pro: $200/mo &middot; use code{" "}
              <span className="font-mono font-semibold tracking-wider text-gold">
                TRY25
              </span>{" "}
              for $50 first month. Cancel anytime.
            </p>
          </div>
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
