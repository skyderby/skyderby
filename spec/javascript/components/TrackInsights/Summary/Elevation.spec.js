import React from 'react'

import renderWithAllProviders from 'testHelpers/renderWithAllProviders'
import TrackViewPreferencesProvider, {
  METRIC,
  IMPERIAL
} from 'components/TrackViewPreferences'
import Elevation from 'components/Tracks/Track/TrackInsights/Summary/Elevation'

describe('Summary/Elevation', () => {
  it('shows elevation rounded to whole digit', () => {
    const { getByLabelText } = renderWithAllProviders(
      <TrackViewPreferencesProvider>
        <Elevation value={1000.373} />
      </TrackViewPreferencesProvider>
    )

    expect(getByLabelText('elevation').textContent).toBe('1000')
  })

  describe('metric units', () => {
    const renderComponent = props => {
      return renderWithAllProviders(
        <TrackViewPreferencesProvider initialValues={{ unitSystem: METRIC }}>
          <Elevation {...props} />
        </TrackViewPreferencesProvider>
      )
    }

    it('correct value', () => {
      const { getByLabelText } = renderComponent({ value: 1000.4 })

      expect(getByLabelText('elevation').textContent).toBe('1000')
    })
  })

  describe('imperial units', () => {
    const renderComponent = props => {
      return renderWithAllProviders(
        <TrackViewPreferencesProvider initialValues={{ unitSystem: IMPERIAL }}>
          <Elevation {...props} />
        </TrackViewPreferencesProvider>
      )
    }

    it('correct value', () => {
      const { getByLabelText } = renderComponent({ value: 1000 })

      expect(getByLabelText('elevation').textContent).toBe('3281')
    })
  })

  describe('empty values', () => {
    it('shows placeholder', () => {
      const { getByLabelText } = renderWithAllProviders(
        <TrackViewPreferencesProvider>
          <Elevation value={null} />
        </TrackViewPreferencesProvider>
      )

      expect(getByLabelText('elevation').textContent).toBe('----')
    })
  })
})
