import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Keep a narrow test collection to avoid running dependency test suites from node_modules
export default defineConfig(({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.tsx'],
    // Exclude node_modules and e2e/playwright files so Vitest only runs our tests
    exclude: ['**/node_modules/**', 'tests/e2e/**', 'playwright.config.ts'],
    // Only include tests under the repo `test/` folder
    include: ['test/**/*.test.{ts,tsx,js,jsx}'],
    // disable worker threads (some environments have issues terminating workers)
    threads: false,
    maxThreads: 1,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src'),
    },
  },
} as any))
