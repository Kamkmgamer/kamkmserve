"use client";
import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { TOKENS } from "../tokens";

const SecretDailyTips: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={className} aria-live="polite" aria-atomic>
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 -top-12 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400/15 to-pink-300/10 blur-3xl" />
          <div className="absolute right-0 top-1/3 w-64 h-64 rounded-full bg-gradient-to-bl from-cyan-300/10 to-indigo-400/15 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <header className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center gap-4 mb-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md" aria-hidden />
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Daily AI Tip
              </h2>
              <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            </motion.div>
            <motion.p 
              className="text-slate-600 dark:text-slate-400 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Smart insights powered by AI
            </motion.p>
          </header>

          <motion.section
            role="region"
            aria-label="Daily AI tip"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-xl"
          >
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Today's Insight
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Powered by AI</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium text-lg">
                  <p>
                    <strong>AI features are now live!</strong> This is a demo of the rich text capabilities.
                  </p>
                  <p className="mt-4">
                    <em>Enjoy seamless integration with your AI backend.</em>
                  </p>
                  <p className="mt-4">
                    Here is a code block example:
                  </p>
                  <pre className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 overflow-x-auto shadow-sm">
                    <code className="text-sm font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
                      // Modern asynchronous function{'\n'}
                      async function fetchData(url) {'{'}{'\n'}
                      {'  '}const response = await fetch(url);{'\n'}
                      {'  '}return response.json();{'\n'}
                      {'}'}
                    </code>
                  </pre>
                  <p className="mt-4">
                    And here is some <code className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-md font-mono border border-slate-200 dark:border-slate-700">inline code</code> for you to see.
                  </p>
                </div>
              </div>
            </div>

            <footer className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-400 shadow-sm" aria-hidden />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Powered by AI
                </span>
              </div>
            </footer>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

export default SecretDailyTips;
