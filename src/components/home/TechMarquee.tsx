"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TOKENS, useReducedMotionPref, useInViewOnce } from "../tokens";
import { Code, Database, Cloud, Zap } from "lucide-react"; // Replace w/ brand icons

interface TechMarqueeProps {
  speed?: number; // base speed in seconds per loop
}

const TechMarquee: React.FC<TechMarqueeProps> = ({ speed = 20 }) => {
  const reduce = useReducedMotionPref();
  const [wrapRef, inView] = useInViewOnce<HTMLDivElement>();
  const [paused, setPaused] = useState(false);

  const items = useMemo(
    () => [
      { label: "React", icon: <Code size={16} /> },
      { label: "TypeScript", icon: <Code size={16} /> },
      { label: "Next.js", icon: <Zap size={16} /> },
      { label: "Node.js", icon: <Code size={16} /> },
      { label: "Tailwind CSS", icon: <Zap size={16} /> },
      { label: "Framer Motion", icon: <Zap size={16} /> },
      { label: "PostgreSQL", icon: <Database size={16} /> },
      { label: "Prisma", icon: <Database size={16} /> },
      { label: "AWS", icon: <Cloud size={16} /> },
      { label: "Vercel", icon: <Cloud size={16} /> },
      { label: "Vite", icon: <Zap size={16} /> },
      { label: "Turborepo", icon: <Zap size={16} /> },
      { label: "Playwright", icon: <Code size={16} /> },
      { label: "Vitest", icon: <Code size={16} /> },
    ],
    []
  );

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`relative overflow-hidden ${TOKENS.surfaceGlass} ${TOKENS.radius.xl} p-6 shadow-lg`}
      role="region"
      aria-label="Technologies used"
    >
      {/* Fade overlays for depth */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-20 md:w-24 bg-gradient-to-r from-white/90 to-transparent dark:from-slate-900/90" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-20 md:w-24 bg-gradient-to-l from-white/90 to-transparent dark:from-slate-900/90" />

      {reduce ? (
        // Reduced motion grid
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 justify-items-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {items.map((item, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-100 dark:text-slate-200 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 backdrop-blur-lg border border-white/20 shadow-sm"
            >
              {item.icon}
              {item.label}
            </motion.span>
          ))}
        </motion.div>
      ) : (
        // Marquee (disabled on small screens for usability)
        <motion.div
          className="hidden sm:flex w-max gap-6 md:gap-8 whitespace-nowrap will-change-transform"
          style={{
            animation:
              inView && !paused
                ? `marquee calc(${speed}s * var(--marquee-speed)) linear infinite`
                : "none",
          }}
          aria-hidden="true"
        >
          {[0, 1].map((track) => (
            <div className="flex gap-6 md:gap-8" key={track}>
              {items.map((item, i) => (
                <motion.span
                  key={`${track}-${i}`}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.12,
                  }}
                  whileHover={{
                    scale: 1.15,
                    rotate: [0, -6, 6, 0],
                    transition: { duration: 0.35 },
                  }}
                  className="group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-100 dark:text-slate-200 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 backdrop-blur-lg border border-white/20 shadow-md cursor-pointer relative"
                >
                  {item.icon}
                  {item.label}
                  <span className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition text-xs bg-black/80 text-white px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {item.label}
                  </span>
                </motion.span>
              ))}
            </div>
          ))}
        </motion.div>
      )}

      {/* Keyframes + Responsive speed */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        /* Responsive marquee speeds */
        .sm\\:flex { --marquee-speed: 1.5; } /* slower on tablets */
        @media (min-width: 1024px) {
          .sm\\:flex { --marquee-speed: 1; } /* normal on desktop */
        }
      `}</style>
    </div>
  );
};

export default TechMarquee;
