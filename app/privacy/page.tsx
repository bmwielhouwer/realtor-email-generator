import type { ReactNode } from "react";

export const metadata = {
  title: "Privacy Policy — Agent Marketing Autopilot",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-silver-dark">
          Last updated: June 5, 2026
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-navy">
          Privacy Policy
        </h1>

        <div className="mt-10 space-y-10">
          <Section title="1. Information We Collect">
            We collect your email address when you subscribe, payment
            information processed securely by Stripe (we never see or store your
            card details), and usage data about how you interact with our tools
            (number of generations, timestamps, content of inputs).
          </Section>

          <Section title="2. How We Use Your Information">
            We use your information to provide and improve the service, send you
            your access code and important account notifications, process
            subscription payments through Stripe, and analyze usage patterns to
            make the product better.
          </Section>

          <Section title="3. Data Storage and Security">
            Your data is stored on secure infrastructure provided by Vercel and
            Upstash. Payment data is handled exclusively by Stripe and never
            touches our servers. We use industry-standard security practices to
            protect your information.
          </Section>

          <Section title="4. Third-Party Services">
            We use Stripe for payment processing, Resend for transactional
            email, Vercel for hosting, and Upstash for data storage. Each of
            these providers has their own privacy policy governing how they
            handle data.
          </Section>

          <Section title="5. Your Rights">
            You can cancel your subscription at any time through the Stripe
            Customer Portal accessible from within the app. To request deletion
            of your account data, email brianwielhouwer@gmail.com.
          </Section>

          <Section title="6. Contact">
            For privacy-related questions, contact brianwielhouwer@gmail.com.
          </Section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-xl font-bold text-navy">{title}</h2>
      <p className="mt-3 text-base leading-relaxed text-silver-dark">
        {children}
      </p>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="bg-navy">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Compass Line Ventures"
            className="h-10 w-auto"
          />
        </a>
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-silver">
          Agent Marketing Autopilot
        </span>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
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
  );
}
