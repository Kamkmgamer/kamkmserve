"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LoadingScreen({
  children,
  durationMs = 1500,
}: {
  children?: React.ReactNode;
  /**
   * When null, the loading screen is persistent (no auto-dismiss).
   * When a number, auto-dismiss after that many milliseconds.
   */
  durationMs?: number | null;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (durationMs === null) return; // persistent mode
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  const overlay = (
    <motion.div
      {...(durationMs === null
        ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
        : { initial: { opacity: 1 }, animate: { opacity: 0 }, transition: { duration: 0.5, delay: 1 } })}
      {...(durationMs === null ? {} : { onAnimationComplete: () => setIsLoading(false) })}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-950"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="text-2xl font-bold text-gray-800 dark:text-gray-200"
      >
        Loading...
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {isLoading && overlay}
      {!isLoading && children}
    </>
  );
}
