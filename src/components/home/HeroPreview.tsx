"use client";
import React from 'react';
import { Sparkles } from 'lucide-react';
import { TOKENS } from '../tokens';
import dynamic from 'next/dynamic';
import { LoadingScreen } from "../layout/LoadingScreen";

const HeavyHeroPreview = dynamic(() => import('./HeroPreviewHeavy'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className={`relative overflow-hidden ${TOKENS.radius.xl} ${TOKENS.surfaceGlass} backdrop-blur-xl border border-white/10`}>
        <LoadingScreen durationMs={null} />
        <div className="relative h-64 md:h-72 flex items-center justify-center text-center p-8" />
      </div>
    </div>
  )
});

const HeroPreview: React.FC<{ simple?: boolean }> = ({ simple = true }) => {
  const [isSimple, setIsSimple] = React.useState(simple);

  if (isSimple) {
    return (
      <div className="relative w-full max-w-4xl mx-auto">
        <div className={`relative overflow-hidden ${TOKENS.radius.xl} ${TOKENS.surfaceGlass} backdrop-blur-xl border border-white/10`}>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-700/10" />
          <div className="relative h-64 md:h-72 flex flex-col items-center justify-center text-center p-8">
            <Sparkles className="h-8 w-8 text-cyan-300 mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">AI-Powered Development</h2>
            <p className="text-lg text-cyan-300 mb-2">Next-generation web applications</p>
            <p className="text-gray-300 text-sm max-w-md">Intelligent, responsive, and beautiful</p>
            <button
              onClick={() => setIsSimple(false)}
              className="mt-6 inline-flex items-center px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
            >
              Open interactive preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute -top-10 right-0 z-50">
        <button
          onClick={() => setIsSimple(true)}
          className="px-3 py-1.5 text-xs rounded-md bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60"
        >
          Back to simple preview
        </button>
      </div>
      <HeavyHeroPreview />
    </div>
  );
};

export default React.memo(HeroPreview);
