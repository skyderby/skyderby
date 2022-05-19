import React from 'react'

import renderWithAllProviders from 'jest/renderWithAllProviders'
import TrackViewPreferencesProvider, {
  METRIC,
  IMPERIAL
} from 'components/TrackViewPreferences'
import Distance from './Distance'

type Props = Parameters<typeof Distance>[0]

describe('Summary/Distance', () => {
  it('shows elevation rounded to whole digit', () => {
    const { getByLabelText } = renderWithAllProviders(
      <TrackViewPreferencesProvider>
        <Distance value={1000.373} zeroWindValue={null} />
      </TrackViewPreferencesProvider>
    )

    expect(getByLabelText('distance').textContent).toBe('1000')
  })

  it('hide wind effect if no zeroWindValue provided', () => {
    const { queryByLabelText } = renderWithAllProviders(
      <TrackViewPreferencesProvider>
        <Distance value={1000.373} zeroWindValue={null} />
      </TrackViewPreferencesProvider>
    )

    expect(queryByLabelText('wind cancelled value')).not.toBeInTheDocument()
  })

  describe('metric units', () => {
    const renderComponent = (props: Props) => {
      return renderWithAllProviders(
        <TrackViewPreferencesProvider initialValues={{ unitSystem: METRIC }}>
          <Distance {...props} />
        </TrackViewPreferencesProvider>
      )
    }

    it('correct value', () => {
      const { getByLabelText } = renderComponent({ value: 1000.4, zeroWindValue: 800 })

      expect(getByLabelText('distance').textContent).toBe('1000')
      expect(getByLabelText('wind cancelled value').textContent).toBe('800')
    })
  })

  describe('imperial units', () => {
    const renderComponent = (props: Props) => {
      return renderWithAllProviders(
        <TrackViewPreferencesProvider initialValues={{ unitSystem: IMPERIAL }}>
          <Distance {...props} />
        </TrackViewPreferencesProvider>
      )
    }

    it('correct value', () => {
      const { getByLabelText } = renderComponent({ value: 2000, zeroWindValue: 1800 })

      expect(getByLabelText('distance').textContent).toBe('1.243')
      expect(getByLabelText('wind cancelled value').textContent).toBe('1.119')
    })
  })
})
