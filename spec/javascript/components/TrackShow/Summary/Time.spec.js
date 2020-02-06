import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import Time from 'components/TrackShow/Summary/Time'

describe('Summary/Time', () => {
  it('shows time rounded to 1 digit', () => {
    const { getByTestId } = render(<Time value={92.373} />)

    expect(getByTestId('value')).toHaveTextContent('92.4')
  })

  it('shows 1 decimal digit when whole number', () => {
    const { getByTestId } = render(<Time value={92} />)

    expect(getByTestId('value')).toHaveTextContent('92.0')
  })

  it('shows placeholder if no value given', () => {
    const { getByTestId } = render(<Time />)

    expect(getByTestId('value')).toHaveTextContent('--.-')
  })

  it('shows placeholder in case of NaN', () => {
    const { getByTestId } = render(<Time value={0 / 0} />)

    expect(getByTestId('value')).toHaveTextContent('--.-')
  })
})
