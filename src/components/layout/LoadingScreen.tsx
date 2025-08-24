"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LoadingScreen({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Adjust this duration as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          onAnimationComplete={() => setIsLoading(false)}
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
      )}
      {!isLoading && children}
    </>
  );
}
