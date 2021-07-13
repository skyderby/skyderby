import React from 'react'

import renderWithAllProviders from 'testHelpers/renderWithAllProviders'
import { METRIC, IMPERIAL } from 'redux/userPreferences'
import Elevation from 'components/Tracks/Track/TrackInsights/Summary/Elevation'

describe('Summary/Elevation', () => {
  it('shows elevation rounded to whole digit', () => {
    const { getByLabelText } = renderWithAllProviders(<Elevation value={1000.373} />)

    expect(getByLabelText('elevation').textContent).toBe('1000')
  })

  describe('metric units', () => {
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: METRIC } }
      return renderWithAllProviders(<Elevation {...props} />, initialState)
    }

    it('correct value', () => {
      const { getByLabelText } = renderComponent({ value: 1000.4 })

      expect(getByLabelText('elevation').textContent).toBe('1000')
    })
  })

  describe('imperial units', () => {
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: IMPERIAL } }
      return renderWithAllProviders(<Elevation {...props} />, initialState)
    }

    it('correct value', () => {
      const { getByLabelText } = renderComponent({ value: 1000 })

      expect(getByLabelText('elevation').textContent).toBe('3281')
    })
  })

  describe('empty values', () => {
    it('shows placeholder', () => {
      const { getByLabelText } = renderWithAllProviders(<Elevation />)

      expect(getByLabelText('elevation').textContent).toBe('----')
    })
  })
})
