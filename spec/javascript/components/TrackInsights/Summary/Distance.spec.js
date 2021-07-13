import React from 'react'

import renderWithAllProviders from 'testHelpers/renderWithAllProviders'
import { METRIC, IMPERIAL } from 'redux/userPreferences'
import Distance from 'components/Tracks/Track/TrackInsights/Summary/Distance'

describe('Summary/Distance', () => {
  it('shows elevation rounded to whole digit', () => {
    const { getByLabelText } = renderWithAllProviders(<Distance value={1000.373} />)

    expect(getByLabelText('distance').textContent).toBe('1000')
  })

  it('hide wind effect if no zeroWindValue provided', () => {
    const { queryByLabelText } = renderWithAllProviders(<Distance value={1000.373} />)

    expect(queryByLabelText('wind cancelled value')).not.toBeInTheDocument()
  })

  describe('metric units', () => {
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: METRIC } }
      return renderWithAllProviders(<Distance {...props} />, initialState)
    }

    it('correct value', () => {
      const { getByLabelText } = renderComponent({ value: 1000.4, zeroWindValue: 800 })

      expect(getByLabelText('distance').textContent).toBe('1000')
      expect(getByLabelText('wind cancelled value').textContent).toBe('800')
    })
  })

  describe('imperial units', () => {
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: IMPERIAL } }
      return renderWithAllProviders(<Distance {...props} />, initialState)
    }

    it('correct value', () => {
      const { getByLabelText } = renderComponent({ value: 2000, zeroWindValue: 1800 })

      expect(getByLabelText('distance').textContent).toBe('1.243')
      expect(getByLabelText('wind cancelled value').textContent).toBe('1.119')
    })
  })
})
