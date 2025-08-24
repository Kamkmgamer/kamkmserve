"use client";
import React from 'react';
import { Sparkles } from 'lucide-react';
import { TOKENS } from '../tokens';
import dynamic from 'next/dynamic';
 

const HeavyHeroPreview = dynamic(() => import('./HeroPreviewHeavy'), { ssr: false });

const HeroPreview: React.FC<{ simple?: boolean }> = ({ simple = true }) => {
  if (simple) {
    return (
      <div className="relative w-full max-w-4xl mx-auto">
        <div className={`relative overflow-hidden ${TOKENS.radius.xl} ${TOKENS.surfaceGlass} backdrop-blur-xl border border-white/10`}>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-700/10" />
          <div className="relative h-64 md:h-72 flex flex-col items-center justify-center text-center p-8">
            <Sparkles className="h-8 w-8 text-cyan-300 mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">AI-Powered Development</h2>
            <p className="text-lg text-cyan-300 mb-2">Next-generation web applications</p>
            <p className="text-gray-300 text-sm max-w-md">Intelligent, responsive, and beautiful</p>
          </div>
        </div>
      </div>
    );
  }
  return <HeavyHeroPreview />;
};

export default React.memo(HeroPreview);
