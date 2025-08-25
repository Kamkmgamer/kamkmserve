"use client";
import React, { useMemo, useState, useCallback, useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Code, Database, Cloud, Zap, Palette, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { TOKENS } from "../tokens";

interface TechItem {
  label: string;
  icon: React.ReactNode;
  category: "frontend" | "backend" | "cms" | "ecommerce" | "ai" | "server";
}

interface TechMarqueeProps {
  speed?: number; // Animation speed in seconds per loop
  direction?: "left" | "right"; // Marquee direction
}

const TechMarquee: React.FC<TechMarqueeProps> = ({ speed = 20, direction = "left" }) => {
  const shouldReduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(wrapRef, { amount: 0.1 });
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const techItems = useMemo<TechItem[]>(
    () => [
      { label: "Webflow", icon: <Palette size={18} />, category: "cms" },
      { label: "Odoo", icon: <Database size={18} />, category: "backend" },
      { label: "WordPress", icon: <Code size={18} />, category: "cms" },
      { label: "HTML5", icon: <Code size={18} />, category: "frontend" },
      { label: "CSS3", icon: <Code size={18} />, category: "frontend" },
      { label: "TypeScript", icon: <Code size={18} />, category: "frontend" },
      { label: "React", icon: <Code size={18} />, category: "frontend" },
      { label: "Next.js", icon: <Zap size={18} />, category: "frontend" },
      { label: "Node.js", icon: <Code size={18} />, category: "backend" },
      { label: "Tailwind CSS", icon: <Palette size={18} />, category: "frontend" },
      { label: "Framer Motion", icon: <Zap size={18} />, category: "frontend" },
      { label: "PostgreSQL", icon: <Database size={18} />, category: "backend" },
      { label: "AWS", icon: <Cloud size={18} />, category: "server" },
      { label: "Shopify", icon: <ShoppingCart size={18} />, category: "ecommerce" },
      { label: "AI Integration", icon: <Zap size={18} />, category: "ai" },
    ],
    []
  );

  const handleCopy = useCallback(
    (label: string, index: number) => {
      navigator.clipboard.writeText(label);
      toast("Copied!", {
        description: `${label} copied to clipboard.`,
        duration: 2000,
      });
      itemRefs.current[index]?.focus();
    },
    [toast]
  );

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`relative overflow-hidden ${TOKENS.surfaceGlass} ${TOKENS.radius.xl} p-4 sm:p-6 md:p-8 shadow-2xl border border-white/10 backdrop-blur-md`}
      role="region"
      aria-label="Khalil's Technology Stack"
    >
      {/* Gradient overlays for visual depth */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-16 md:w-24 bg-gradient-to-r from-white/95 dark:from-slate-950/95 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-16 md:w-24 bg-gradient-to-l from-white/95 dark:from-slate-950/95 to-transparent" />

      {shouldReduceMotion ? (
        // Static grid for reduced motion
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 justify-items-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {techItems.map((item, i) => (
            <motion.button
              key={i}
              ref={(el) => { itemRefs.current[i] = el; }}
              onClick={() => handleCopy(item.label, i)}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="flex items-center gap-2 rounded-full px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 backdrop-blur-lg border border-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              aria-label={`Copy ${item.label} to clipboard`}
            >
              {item.icon}
              <span>{item.label}</span>
              <span className="sr-only">{item.category}</span>
            </motion.button>
          ))}
        </motion.div>
      ) : (
        // Marquee animation for non-reduced motion
        <motion.div
          className="flex w-max gap-4 sm:gap-6 md:gap-8 whitespace-nowrap will-change-transform"
          style={{
            animation: inView && !paused ? `marquee ${speed}s linear infinite ${direction === "right" ? "reverse" : ""}` : "none",
          }}
          aria-hidden="true"
        >
          {[0, 1].map((track) => (
            <div className="flex gap-4 sm:gap-6 md:gap-8" key={track}>
              {techItems.map((item, i) => (
                <motion.button
                  key={`${track}-${i}`}
                  ref={(el) => { itemRefs.current[track * techItems.length + i] = el; }}
                  onClick={() => handleCopy(item.label, track * techItems.length + i)}
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.15,
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, -4, 4, 0],
                    transition: { duration: 0.3 },
                  }}
                  whileFocus={{
                    scale: 1.1,
                    transition: { duration: 0.3 },
                  }}
                  className="group flex items-center gap-2 rounded-full px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 backdrop-blur-lg border border-white/20 shadow-lg cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  aria-label={`Copy ${item.label} to clipboard`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <span className="sr-only">{item.category}</span>
                  <span className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 text-xs bg-black/90 text-white px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                    {item.label} ({item.category})
                  </span>
                </motion.button>
              ))}
            </div>
          ))}
        </motion.div>
      )}

      {/* CSS for marquee animation and responsive speeds */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .flex { --marquee-speed: 1.8; } /* Mobile */
        @media (min-width: 640px) { .flex { --marquee-speed: 1.5; } } /* Tablet */
        @media (min-width: 1024px) { .flex { --marquee-speed: 1; } } /* Desktop */
        @media (min-width: 1280px) { .flex { --marquee-speed: 0.8; } } /* Large Desktop */
      `}</style>
    </div>
  );
};

export default TechMarquee;