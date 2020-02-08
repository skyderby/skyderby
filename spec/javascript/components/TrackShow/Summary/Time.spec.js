import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import Time from 'components/TrackShow/Summary/Time'

describe('Summary/Time', () => {
  it('shows time rounded to 1 digit', () => {
    const { getByLabelText } = render(<Time value={92.373} />)

    expect(getByLabelText('duration').textContent).toBe('92.4')
  })

  it('shows 1 decimal digit when whole number', () => {
    const { getByLabelText } = render(<Time value={92} />)

    expect(getByLabelText('duration').textContent).toBe('92.0')
  })

  it('shows placeholder if no value given', () => {
    const { getByLabelText } = render(<Time />)

    expect(getByLabelText('duration').textContent).toBe('--.-')
  })

  it('shows placeholder in case of NaN', () => {
    const { getByLabelText } = render(<Time value={0 / 0} />)

    expect(getByLabelText('duration').textContent).toBe('--.-')
  })
})
