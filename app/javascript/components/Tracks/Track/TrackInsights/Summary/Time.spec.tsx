import React from 'react'
import renderWithAllProviders from 'jest/renderWithAllProviders'

import Time from './Time'

describe('Summary/Time', () => {
  it('shows time rounded to 1 digit', () => {
    const { getByLabelText } = renderWithAllProviders(<Time value={92.373} />)

    expect(getByLabelText('duration').textContent).toBe('92.4')
  })

  it('shows 1 decimal digit when whole number', () => {
    const { getByLabelText } = renderWithAllProviders(<Time value={92} />)

    expect(getByLabelText('duration').textContent).toBe('92.0')
  })

  it('shows placeholder in case of NaN', () => {
    const { getByLabelText } = renderWithAllProviders(<Time value={0 / 0} />)

    expect(getByLabelText('duration').textContent).toBe('--.-')
  })
})
