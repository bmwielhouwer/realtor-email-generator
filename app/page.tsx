import EmailGenerator from "./EmailGenerator";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-navy-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M12 2 4 7v13h16V7l-8-5Z" />
                <path d="M9 20v-6h6v6" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide text-navy-100">
                Compass Line Ventures
              </div>
              <div className="text-lg font-bold">Realtor Email Generator</div>
            </div>
          </div>
          <span className="hidden text-xs font-medium uppercase tracking-widest text-navy-200 sm:block">
            Powered by Claude
          </span>
        </div>
      </header>

      <section className="bg-gradient-to-b from-navy-900 to-navy-700 text-white">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-10 sm:pt-14">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Five cold emails. One click. Built for real estate.
          </h1>
          <p className="mt-3 max-w-2xl text-navy-100">
            Tell us about you and your market. We&apos;ll craft five
            professional, ready-to-send outreach emails tailored to your
            audience.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-10 max-w-5xl px-6 pb-20">
        <EmailGenerator />
      </section>

      <footer className="border-t border-navy-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-navy-700">
          &copy; {new Date().getFullYear()} Compass Line Ventures. All rights
          reserved.
        </div>
      </footer>
    </main>
  );
}
