import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import HomePage from '@/app/page'

// a11y: home page smoke test
// Use "a11y" in test name to allow -t filtering in CI
it('a11y: home page has no detectable a11y violations', async () => {
  const { container } = render(<HomePage />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
