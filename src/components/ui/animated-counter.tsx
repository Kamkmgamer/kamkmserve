"use client";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useReducedMotionPref } from "../tokens";

type Props = { end: number; duration?: number; suffix?: string };

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const AnimatedCounter: React.FC<Props> = ({ end, duration = 1.2, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -30% 0px" });
  const reduce = useReducedMotionPref();

  useEffect(() => {
    if (!isInView) return;
    if (reduce) {
      setCount(end);
      return;
    }
    let raf: number | null = null;
    const start = performance.now();
    const run = (t: number) => {
      const p = Math.min((t - start) / (duration * 1000), 1);
      setCount(Math.round(easeOutCubic(p) * end));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isInView, end, duration, reduce]);

  return <span ref={ref} aria-live="polite">{count}{suffix}</span>;
};

export default AnimatedCounter;
