"use client";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { TOKENS } from "../tokens";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const CTA: React.FC = () => {
  return (
    <section className="relative py-20">
      {/* Gradient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 blur-3xl"
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`relative z-10 overflow-hidden ${TOKENS.surfaceGlass} ${TOKENS.radius.xl} p-8 md:p-12 ${TOKENS.shadow}`}
      >
        {/* Decorative Shape */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl"
        />

        <div className="mx-auto max-w-2xl text-center">
          <motion.h3
            variants={fadeUp}
            custom={0}
            className={`mb-4 text-3xl sm:text-4xl font-extrabold tracking-tight ${TOKENS.textHeading}`}
          >
            Ready to Start Your Project?
          </motion.h3>

          <motion.p
            variants={fadeUp}
            custom={1}
            className={`${TOKENS.textBody} mb-10 text-base sm:text-lg`}
          >
            Let’s bring your vision to life with clean code, thoughtful design, and a seamless experience from start to finish.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={2}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <Link href="/contact">
              <button
                className="transition-transform duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold"
              >
                Get Started Today
              </button>
            </Link>

            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Schedule a call on Calendly"
            >
              <button
                className="transition-transform duration-300 hover:scale-105 bg-white text-blue-700 border border-blue-500 px-6 py-3 rounded-full font-semibold flex items-center"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule a Call
              </button>
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-6 text-xs text-slate-500 dark:text-slate-400"
          >
            Prefer email?{" "}
            <a
              className="underline underline-offset-2 transition-colors hover:text-blue-500 dark:hover:text-blue-400"
              href="mailto:khalilabdalmajeed@gmail.com?subject=Project%20Inquiry&body=Tell%20me%20about%20your%20project..."
            >
              Send a brief
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
