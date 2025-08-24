declare module 'jest-axe' {
  import type { AxeResults, ElementContext, RunOptions, Result } from 'axe-core'

  export interface JestAxeConfigureOptions {
    globalOptions?: RunOptions
    rules?: Array<{ id: string; enabled: boolean }>
  }

  export function axe(
    context?: ElementContext,
    options?: RunOptions
  ): Promise<AxeResults>

  export function configureAxe(options?: JestAxeConfigureOptions): typeof axe

  export function toHaveNoViolations(results?: AxeResults | Result[]): any
}
