"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// Floating particle component
const FloatingParticle = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 100, x: Math.random() * 100 - 50 }}
    animate={{ 
      opacity: [0, 1, 0], 
      y: -100, 
      x: Math.random() * 200 - 100,
      scale: [0, 1, 0]
    }}
    transition={{ 
      duration: 3 + Math.random() * 2, 
      delay,
      repeat: Infinity,
      ease: "easeOut"
    }}
    className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm"
    style={{
      left: `${Math.random() * 100}%`,
      bottom: 0
    }}
  />
);

// Glowing orb component
const GlowingOrb = ({ index }: { index: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 1.5, 0],
      opacity: [0, 0.6, 0],
      rotate: 360
    }}
    transition={{
      duration: 2,
      delay: index * 0.2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"
  />
);

// Progress bar component
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-80 h-1 bg-gray-800/20 rounded-full overflow-hidden backdrop-blur-sm">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full relative"
    >
      <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
    </motion.div>
  </div>
);

// Loading text with typewriter effect
const TypewriterText = ({ text, isVisible }: { text: string; isVisible: boolean }) => (
  <motion.div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
    {text.split("").map((char, index) => (
      <motion.span
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ 
          delay: index * 0.1,
          duration: 0.3,
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 2
        }}
        className="text-4xl md:text-6xl inline-block"
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ))}
  </motion.div>
);

export function LoadingScreen({
  children,
  durationMs = 1500,
}: {
  children?: React.ReactNode;
  durationMs?: number | null;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState(0);
  const [showExit, setShowExit] = useState(false);

  const loadingTexts = ["Initializing...", "Loading Assets...", "Almost Ready...", "Welcome!"];

  useEffect(() => {
    if (durationMs === null) return;

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15, 100);
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setShowExit(true), 500);
        }
        return newProgress;
      });
    }, 100);

    // Update loading stage
    const stageInterval = setInterval(() => {
      setLoadingStage(prev => (prev + 1) % loadingTexts.length);
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, [durationMs, loadingTexts.length]);

  const handleExitComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      <AnimatePresence onExitComplete={handleExitComplete}>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.1,
              filter: "blur(10px)",
              transition: { duration: 0.8, ease: "easeInOut" }
            }}
            className="fixed inset-0 z-50 overflow-hidden"
          >
            {/* Animated gradient background */}
            <motion.div
              animate={{
                background: [
                  "linear-gradient(45deg, #0f0f23, #1a1a2e, #16213e)",
                  "linear-gradient(45deg, #1a1a2e, #16213e, #0f3460)",
                  "linear-gradient(45deg, #16213e, #0f3460, #533483)",
                  "linear-gradient(45deg, #0f3460, #533483, #1a1a2e)"
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 20 }, (_, i) => i).map((i) => (
                <FloatingParticle key={i} delay={i * 0.2} />
              ))}
            </div>

            {/* Glowing orbs */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-32 h-32">
                {Array.from({ length: 3 }, (_, i) => i).map((i) => (
                  <GlowingOrb key={i} index={i} />
                ))}
              </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
              {/* Logo/Icon area */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mb-12"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 border-4 border-transparent bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full p-1"
                  >
                    <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-4 border-cyan-400/30 rounded-full"
                  />
                </div>
              </motion.div>

              {/* Loading text */}
              <div className="mb-8">
                <TypewriterText text={loadingTexts[loadingStage] ?? "Loading..."} isVisible={true} />
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <ProgressBar progress={progress} />
              </div>

              {/* Progress percentage */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/70 text-lg font-medium mb-8"
              >
                {Math.round(progress)}%
              </motion.div>

              {/* Animated dots */}
              <div className="flex space-x-2">
                {Array.from({ length: 3 }, (_, i) => i).map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                  />
                ))}
              </div>

              {/* Finish animation */}
              {showExit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400"
                  >
                    ✓
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-32 h-32">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-full h-full border-t-2 border-l-2 border-cyan-400/20 rounded-tl-3xl"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-full h-full border-b-2 border-r-2 border-purple-400/20 rounded-br-3xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}