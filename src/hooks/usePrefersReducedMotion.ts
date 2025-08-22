// src/hooks/usePrefersReducedMotion.ts
import { useState, useEffect } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [prefersReduce, setPrefersReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setPrefersReduce(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduce;
}