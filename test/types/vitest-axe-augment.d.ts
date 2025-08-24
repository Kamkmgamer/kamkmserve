// Type augmentation so Vitest recognizes jest-axe matcher added via expect.extend
import 'vitest'

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): void
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void
  }
}
