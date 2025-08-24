import '@testing-library/jest-dom'
import React from 'react'
import { expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

// Register jest-axe matchers
expect.extend({ toHaveNoViolations })

// jsdom polyfills for browser-only APIs used by components/animation libs
class MockIntersectionObserver {
  constructor(_cb: any, _options?: any) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] as any[] }
}
(globalThis as any).IntersectionObserver = (globalThis as any).IntersectionObserver || MockIntersectionObserver

class MockResizeObserver {
  constructor(_cb: any) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || MockResizeObserver

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    const { unoptimized, jsx, loader, fill, priority, quality, sizes, ...rest } = props || {}
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { src, alt, ...rest })
  },
}))

// Canvas: jsdom defines getContext but throws; override with a minimal stub
;(HTMLCanvasElement.prototype as any).getContext = () => {
  // Return a very small 2D context stub sufficient for render-only code paths
  return {
    // no-op drawing methods
    clearRect: () => {},
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    fill: () => {},
    drawImage: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    // text
    measureText: () => ({ width: 0 }),
    fillText: () => {},
    strokeText: () => {},
    // image data
    getImageData: () => ({ data: new Uint8ClampedArray(), width: 0, height: 0 }),
    putImageData: () => {},
    createImageData: () => ({ data: new Uint8ClampedArray(), width: 0, height: 0 }),
    // transform
    setTransform: () => {},
  } as any
}
