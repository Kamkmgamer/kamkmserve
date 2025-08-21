import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Content Overlay */}
      <div className="relative">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-token bg-surface px-3 py-1 text-xs text-muted backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
              Launch websites faster — no code required
            </span>
            <h1 className="mt-6 bg-[linear-gradient(90deg,#60a5fa,#a78bfa,#34d399,#60a5fa)] bg-[length:200%_100%] bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl animate-[shimmer_8s_linear_infinite]">
              Build and host beautiful websites in minutes
            </h1>
            <p className="mt-5 text-lg leading-7 text-muted">
              KAMKM Serve is your all‑in‑one platform for website building and managed web services. Design, deploy, and scale with zero DevOps overhead.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-white shadow-card transition hover:opacity-90"
              >
                Get Started Free
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-token bg-surface px-6 py-3 text-[var(--color-text)] shadow-card backdrop-blur transition hover:shadow"
              >
                Explore Features
              </Link>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 items-center gap-6 opacity-80 sm:grid-cols-3 md:grid-cols-6">
            {[
              "Nova Labs",
              "PixelSmith",
              "Skyhost",
              "Asteria",
              "Brightly",
              "Helix Cloud",
            ].map((brand) => (
              <div
                key={brand}
                className="flex items-center justify-center rounded-xl border border-token bg-surface px-3 py-3 text-sm text-muted backdrop-blur"
              >
                {brand}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Powerful features for modern teams</h2>
            <p className="mt-3 text-muted">
              Everything you need to design, publish, and operate professional websites — all in one place.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Visual Site Builder",
                desc: "Drag‑and‑drop sections, responsive by default, with 50+ templates.",
                icon: "🧩",
              },
              {
                title: "One‑click Deploy",
                desc: "Global edge hosting, SSL, and CDN baked in. No configuration needed.",
                icon: "⚡",
              },
              {
                title: "CMS & Blog",
                desc: "Structured content, scheduling, and AI‑assisted writing tools.",
                icon: "📝",
              },
              {
                title: "Forms & CRM",
                desc: "Collect leads, manage contacts, and automate follow‑ups.",
                icon: "📬",
              },
              {
                title: "E‑commerce Ready",
                desc: "Product pages, carts, and checkout with popular gateways.",
                icon: "🛒",
              },
              {
                title: "Analytics & SEO",
                desc: "Real‑time insights, sitemaps, and on‑page SEO recommendations.",
                icon: "📈",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-token bg-surface p-5 shadow-card transition hover:shadow-md backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl">{f.icon}</div>
                  <div>
                    <h3 className="text-lg font-medium">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Highlight/Stats */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 rounded-2xl border border-token bg-surface p-8 shadow-card backdrop-blur md:grid-cols-3">
            {[
              { k: "Websites launched", v: "12,400+" },
              { k: "Avg. page speed", v: "99/100" },
              { k: "Uptime", v: "99.99%" },
            ].map((s) => (
              <div key={s.k} className="text-center">
                <div className="text-3xl font-semibold">{s.v}</div>
                <div className="mt-1 text-sm text-muted">{s.k}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-3 text-muted">Start free. Scale as you grow. Cancel anytime.</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "$0",
                period: "/mo",
                features: [
                  "1 website",
                  "Basic templates",
                  "Community support",
                  "Shared hosting",
                ],
                cta: "Start for Free",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$19",
                period: "/mo",
                features: [
                  "10 websites",
                  "Premium templates",
                  "Custom domain",
                  "Edge CDN hosting",
                  "Priority support",
                ],
                cta: "Start Pro",
                highlight: true,
              },
              {
                name: "Business",
                price: "$79",
                period: "/mo",
                features: [
                  "Unlimited websites",
                  "Team collaboration",
                  "SLA & SSO",
                  "Advanced analytics",
                  "Dedicated support",
                ],
                cta: "Contact Sales",
                highlight: false,
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-6 backdrop-blur ${
                  p.highlight
                    ? "border-token bg-brand text-white shadow-xl"
                    : "border-token bg-surface shadow-card"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-lime-400 px-2 py-0.5 text-xs font-medium text-black">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="pb-1 text-sm opacity-70">{p.period}</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm opacity-90">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-lime-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href="#"
                    className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm transition ${
                      p.highlight
                        ? "bg-white text-black hover:opacity-90"
                        : "border border-token bg-surface text-muted hover:shadow-card"
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Loved by founders and agencies</h2>
            <p className="mt-3 text-muted">Here’s what our customers say about building with KAMKM Serve.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "We launched a fully responsive marketing site over a weekend. The builder feels fast and the hosting is ridiculously quick.",
                name: "Amira S.",
                role: "Founder, Brightly",
              },
              {
                quote:
                  "As an agency, we ship more sites with fewer engineers. Built‑in forms and analytics save hours every week.",
                name: "Leo M.",
                role: "Director, PixelSmith",
              },
              {
                quote:
                  "The best upgrade we made this year. Our SEO scores increased and deployments are now one click.",
                name: "Nora T.",
                role: "Growth Lead, Nova Labs",
              },
            ].map((t, i) => (
              <figure
                key={i}
                className="rounded-2xl border border-token bg-surface p-5 shadow-card backdrop-blur"
              >
                <blockquote className="text-sm leading-6">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-xs text-muted">
                  <span className="font-medium">{t.name}</span> — {t.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-5xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Frequently asked questions</h2>
            <p className="mt-3 text-muted">Have another question? Reach out via chat or email.</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {[
              {
                q: "Can I use my own domain?",
                a: "Yes. Connect custom domains on Pro and Business plans with automatic SSL.",
              },
              {
                q: "Do you offer a free plan?",
                a: "Absolutely. Build and publish your first site for free with shared hosting.",
              },
              {
                q: "Is there an API?",
                a: "A REST and GraphQL API are in private beta for CMS and deployments.",
              },
              {
                q: "Can I export my site?",
                a: "You own your content. Export static files anytime from your dashboard.",
              },
            ].map((f) => (
              <div key={f.q} className="rounded-2xl border border-token bg-surface p-5 backdrop-blur">
                <h3 className="font-medium">{f.q}</h3>
                <p className="mt-1 text-sm text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

