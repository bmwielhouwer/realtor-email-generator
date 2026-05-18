import EmailGenerator from "./EmailGenerator";

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
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.25em] text-silver sm:block">
            Realtor Email Generator
          </span>
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
            Generate Professional Cold Emails in Seconds
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-silver sm:text-lg">
            Built exclusively for real estate professionals
          </p>
          <div className="mx-auto mt-10 h-px w-20 bg-gold" />
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto -mt-16 max-w-4xl px-6 pb-24 sm:-mt-20">
          <EmailGenerator />
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
