"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import type { Variants } from "framer-motion";
import { Star } from "lucide-react";
import { TOKENS, useReducedMotionPref, useInViewOnce } from "../tokens";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

interface TestimonialCardProps extends Testimonial {}

const cardVariants: Variants = {
  enter: {
    x: 50,
    opacity: 0,
    scale: 0.96,
  },
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: easeInOut,
    },
  },
  exit: {
    x: -50,
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.4,
      ease: easeInOut,
    },
  },
};

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role }) => (
  <motion.figure
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    className={`${TOKENS.surfaceGlass} ${TOKENS.radius.lg} p-6 ${TOKENS.shadow} backdrop-blur-md`}
  >
    <div className="mb-3 flex gap-1 text-amber-400" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-current" />
      ))}
    </div>
    <blockquote className="mb-4 text-lg italic text-slate-700 dark:text-slate-200">
      "{quote}"
    </blockquote>
    <figcaption className={`text-sm ${TOKENS.textMuted}`}>
      <span className="font-medium text-slate-800 dark:text-slate-100">{author}</span> · {role}
    </figcaption>
  </motion.figure>
);

const Testimonials: React.FC = () => {
  const slides: Testimonial[] = [
    {
      quote:
        "Delivered ahead of schedule with flawless performance. Our conversions improved immediately.",
      author: "Alex Rivera",
      role: "Marketing Lead, Nova",
    },
    {
      quote:
        "Clean architecture and superb communication. The handoff to our team was effortless.",
      author: "Priya Shah",
      role: "CTO, LumenX",
    },
    {
      quote:
        "Beautiful UI and lightning fast. SEO gains were visible within weeks.",
      author: "Daniel Kim",
      role: "Founder, Arc Labs",
    },
  ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotionPref();
  const [wrapRef, inView] = useInViewOnce<HTMLDivElement>();

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (reduce || paused || !inView) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [reduce, paused, inView]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          prev();
          setPaused(true);
        }
        if (e.key === "ArrowRight") {
          next();
          setPaused(true);
        }
      }}
      tabIndex={0}
    >
      <div className="mx-auto max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            aria-live="polite"
            role="group"
            aria-label={`Testimonial ${index + 1} of ${slides.length}`}
          >
            {slides[index] && <TestimonialCard {...slides[index]} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to testimonial ${i + 1}`}
            aria-current={i === index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === index
                ? "w-6 bg-amber-400 shadow-lg"
                : "bg-white/50 hover:bg-white/70"
            } ${TOKENS.ring}`}
            onClick={() => {
              setIndex(i);
              setPaused(true);
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={prev}
          aria-label="Previous testimonial"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 transition-colors"
        >
          Prev
        </button>
        <button
          onClick={next}
          aria-label="Next testimonial"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Testimonials;
