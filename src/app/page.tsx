import React from "react";
import { type Metadata } from "next";
import Hero from "../components/home/Hero";
import TechMarquee from "../components/home/TechMarquee";
import CTA from "../components/home/CTA";
import Process from "../components/home/Process";
import PricingTeaser from "../components/home/PricingTeaser";
import FAQ from "../components/home/FAQ";
import CaseStudies from "../components/home/CaseStudies";
import Testimonials from "../components/home/Testimonials";
import SectionWrapper from "../components/layout/SectionWrapper";
import Container from "../components/layout/Container";
import SecretDailyTips from "../components/secret/SecretDailyTips";

export const metadata: Metadata = {
  title: "KAMKM Serve \u2014 Modern Web Development & Design",
  description:
    "Full\u2011stack web development, UI/UX design, and consulting. High\u2011quality sites and apps with performance, accessibility, and great UX.",
  openGraph: {
    title: "KAMKM Serve \u2014 Modern Web Development & Design",
    description:
      "Full\u2011stack web development, UI/UX design, and consulting. High\u2011quality sites and apps with performance, accessibility, and great UX.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KAMKM Serve \u2014 Modern Web Development & Design",
    description:
      "Full\u2011stack web development, UI/UX design, and consulting. High\u2011quality sites and apps with performance, accessibility, and great UX.",
  },
};

export default function HomePage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 rounded bg-blue-600 px-3 py-2 text-white"
      >
        Skip to content
      </a>

      <Hero />

      <SectionWrapper>
        <SecretDailyTips className="py-12" />
      </SectionWrapper>

      <div id="main" />

      <SectionWrapper className="py-10">
        <TechMarquee />
      </SectionWrapper>

      <SectionWrapper
        title="Recent Work"
        subtitle="A snapshot of projects that improved performance and outcomes."
        center
      >
        <CaseStudies />
      </SectionWrapper>

      <SectionWrapper>
        <Process />
      </SectionWrapper>

      <SectionWrapper
        title="Flexible Ways to Partner"
        subtitle="Pick a track that fits your scope and timeline."
        center
      >
        <PricingTeaser />
      </SectionWrapper>

      <SectionWrapper className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold">Client Feedback</h2>
          <p className="opacity-90">
            Trusted by teams to deliver quality and speed.
          </p>
        </div>
        <Testimonials />
      </SectionWrapper>

      <SectionWrapper
        title="Frequently Asked Questions"
        subtitle="Quick answers to common questions."
        center
      >
        <FAQ />
      </SectionWrapper>

      <Container>
        <CTA />
      </Container>
    </div>
  );
}

