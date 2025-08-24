import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import HomePage from '@/app/page'

// a11y: home page smoke test
// Use "a11y" in test name to allow -t filtering in CI
it('a11y: home page has no detectable a11y violations', async () => {
  const { container } = render(<HomePage />)
  const results = await axe(container)
  if (results.violations.length) {
    // Print helpful details for debugging in CI/logs
    // eslint-disable-next-line no-console
    console.error(
      'Axe violations:',
      JSON.stringify(
        results.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          helpUrl: v.helpUrl,
          nodes: v.nodes?.slice(0, 5).map(n => ({
            html: n.html,
            target: n.target,
            failureSummary: n.failureSummary,
          })),
        })),
        null,
        2,
      ),
    )
  }
  expect(results.violations).toHaveLength(0)
})
