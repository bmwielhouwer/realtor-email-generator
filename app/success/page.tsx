import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're in | Agent Marketing Autopilot",
  description:
    "Your Agent Marketing Autopilot subscription is confirmed. Check your inbox for your access code and start generating.",
};

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen flex-col bg-navy">
      <header className="bg-navy">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Compass Line Ventures"
              className="h-10 w-auto"
            />
          </a>
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.25em] text-silver md:block">
            Agent Marketing Autopilot
          </span>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
            <svg
              className="h-8 w-8 text-gold"
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
          </div>

          <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Founding Member
          </div>
          <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-navy sm:text-4xl">
            You&apos;re in. Welcome aboard.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-silver-dark sm:text-base">
            Your subscription is confirmed. We&apos;ve emailed your access code &mdash;
            check your inbox (and spam, just in case), then paste it into the
            generator to start creating listing descriptions, social posts, and
            follow-up sequences.
          </p>

          <a
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:ring-offset-2"
          >
            Go to the app
          </a>

          <p className="mt-6 text-xs text-silver-dark">
            Didn&apos;t get your code? Reply to your receipt email and Brian will
            sort it out.
          </p>
        </div>
      </section>

      <footer className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 sm:flex-row sm:justify-between">
          <img
            src="/logo.png"
            alt="Compass Line Ventures"
            className="h-9 w-auto"
          />
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
