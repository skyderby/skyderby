import React from 'react'

import renderWithAllProviders from 'jest/renderWithAllProviders'
import TrackViewPreferencesProvider, {
  METRIC,
  IMPERIAL
} from 'components/TrackViewPreferences'
import Elevation from './Elevation'

type Props = Parameters<typeof Elevation>[0]

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
    const renderComponent = (props: Props) => {
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
    const renderComponent = (props: Props) => {
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
