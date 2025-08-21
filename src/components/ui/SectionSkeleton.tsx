import React from "react";

interface SectionSkeletonProps {
  className?: string;
  lines?: number;
}

const SectionSkeleton: React.FC<SectionSkeletonProps> = ({ 
  className = "", 
  lines = 3 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Title skeleton */}
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg mb-6 max-w-md mx-auto" />
      
      {/* Content skeleton */}
      <div className="space-y-4">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded max-w-sm" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionSkeleton;
