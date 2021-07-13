import React from 'react'
import { render } from '@testing-library/react'

import WindEffect from 'components/Tracks/Track/TrackInsights/Summary/WindEffect'

describe('Summary/WindEffect', () => {
  it('when possitive wind effect', () => {
    const { getByLabelText } = render(<WindEffect rawValue={5600} zeroWindValue={5005} />)

    expect(getByLabelText('wind cancelled value')).toHaveTextContent('5005')
    expect(getByLabelText('wind effect')).toHaveTextContent('+595')
  })

  it('when negative wind effect', () => {
    const { getByLabelText } = render(<WindEffect rawValue={5000} zeroWindValue={5500} />)

    expect(getByLabelText('wind cancelled value')).toHaveTextContent('5500')
    expect(getByLabelText('wind effect')).toHaveTextContent('-500')
  })

  it('with value presenter', () => {
    const { getByLabelText } = render(
      <WindEffect rawValue={5000} zeroWindValue={5500} valuePresenter={val => val / 2} />
    )

    expect(getByLabelText('wind cancelled value')).toHaveTextContent('2750')
    expect(getByLabelText('wind effect')).toHaveTextContent('-250')
  })
})
