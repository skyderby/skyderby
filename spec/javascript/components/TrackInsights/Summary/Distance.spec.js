import React from 'react'

import renderWithRedux from 'testHelpers/renderWithRedux'
import { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
import Distance from 'components/TrackInsights/Summary/Distance'

describe('Summary/Distance', () => {
  it('shows elevation rounded to whole digit', () => {
    const { getByLabelText } = renderWithRedux(<Distance value={1000.373} />)

    expect(getByLabelText('distance').textContent).toBe('1000')
  })

  it('hide wind effect if no zeroWindValue provided', () => {
    const { queryByLabelText } = renderWithRedux(<Distance value={1000.373} />)

    expect(queryByLabelText('wind cancelled value')).not.toBeInTheDocument()
  })

  describe('metric units', () => {
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: METRIC } }
      return renderWithRedux(<Distance {...props} />, initialState)
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
      return renderWithRedux(<Distance {...props} />, initialState)
    }

    it('correct value', () => {
      const { getByLabelText } = renderComponent({ value: 2000, zeroWindValue: 1800 })

      expect(getByLabelText('distance').textContent).toBe('1.243')
      expect(getByLabelText('wind cancelled value').textContent).toBe('1.119')
    })
  })
})
