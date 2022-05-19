import React from 'react'

import renderWithAllProviders from 'jest/renderWithAllProviders'
import TrackViewPreferencesProvider, {
  METRIC,
  IMPERIAL
} from 'components/TrackViewPreferences'
import VerticalSpeed from './VerticalSpeed'

type Props = Parameters<typeof VerticalSpeed>[0]
describe('Summary/VerticalSpeed', () => {
  describe('metric units', () => {
    const renderComponent = (props: Props) => {
      return renderWithAllProviders(
        <TrackViewPreferencesProvider initialValues={{ unitSystem: METRIC }}>
          <VerticalSpeed {...props} />
        </TrackViewPreferencesProvider>
      )
    }

    it('average value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 }
      })

      expect(getByLabelText('average vertical speed').textContent).toBe('84')
    })

    it('max value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 }
      })

      expect(getByLabelText('maximum vertical speed').textContent).toBe('108')
    })

    it('min value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 }
      })

      expect(getByLabelText('minimum vertical speed').textContent).toBe('72')
    })
  })

  describe('imperial units', () => {
    const renderComponent = (props: Props) => {
      return renderWithAllProviders(
        <TrackViewPreferencesProvider initialValues={{ unitSystem: IMPERIAL }}>
          <VerticalSpeed {...props} />
        </TrackViewPreferencesProvider>
      )
    }

    it('average value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 }
      })

      expect(getByLabelText('average vertical speed').textContent).toBe('52')
    })

    it('max value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 }
      })

      expect(getByLabelText('maximum vertical speed').textContent).toBe('67')
    })

    it('min value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 }
      })

      expect(getByLabelText('minimum vertical speed').textContent).toBe('45')
    })
  })

  describe('empty values', () => {
    const renderComponent = (props: Props) => {
      return renderWithAllProviders(
        <TrackViewPreferencesProvider initialValues={{ unitSystem: METRIC }}>
          <VerticalSpeed {...props} />
        </TrackViewPreferencesProvider>
      )
    }

    it('average value - NaN', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 0 / 0, min: 20, max: 30 }
      })

      expect(getByLabelText('average vertical speed').textContent).toBe('---')
    })

    it('min value - null', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: null, max: 30 }
      })

      expect(getByLabelText('minimum vertical speed').textContent).toBe('---')
    })
  })
})
