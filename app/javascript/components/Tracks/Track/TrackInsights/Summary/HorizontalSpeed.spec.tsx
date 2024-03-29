import React from 'react'

import renderWithAllProviders from 'jest/renderWithAllProviders'
import TrackViewPreferencesProvider, {
  METRIC,
  IMPERIAL
} from 'components/TrackViewPreferences'
import HorizontalSpeed from './HorizontalSpeed'

type Props = Parameters<typeof HorizontalSpeed>[0]

describe('Summary/VerticalSpeed', () => {
  describe('metric units', () => {
    const renderComponent = (props: Props) => {
      return renderWithAllProviders(
        <TrackViewPreferencesProvider initialValues={{ unitSystem: METRIC }}>
          <HorizontalSpeed {...props} />
        </TrackViewPreferencesProvider>
      )
    }

    it('hide wind effect if no zeroWindValue provided', () => {
      const { queryByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 },
        zeroWindValue: null
      })

      expect(queryByLabelText('wind cancelled value')).not.toBeInTheDocument()
    })

    it('average value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 },
        zeroWindValue: null
      })

      expect(getByLabelText('average horizontal speed').textContent).toBe('84')
    })

    it('wind effect value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 },
        zeroWindValue: 20
      })

      expect(getByLabelText('wind cancelled value').textContent).toBe('72')
      expect(getByLabelText('wind effect').textContent).toBe('+12')
    })

    it('max value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 },
        zeroWindValue: null
      })

      expect(getByLabelText('maximum horizontal speed').textContent).toBe('108')
    })

    it('min value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 },
        zeroWindValue: null
      })

      expect(getByLabelText('minimum horizontal speed').textContent).toBe('72')
    })
  })

  describe('imperial units', () => {
    const renderComponent = (props: Props) => {
      return renderWithAllProviders(
        <TrackViewPreferencesProvider initialValues={{ unitSystem: IMPERIAL }}>
          <HorizontalSpeed {...props} />
        </TrackViewPreferencesProvider>
      )
    }

    it('average value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 },
        zeroWindValue: null
      })

      expect(getByLabelText('average horizontal speed').textContent).toBe('52')
    })

    it('wind effect value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 },
        zeroWindValue: 20
      })

      expect(getByLabelText('wind cancelled value').textContent).toBe('45')
      expect(getByLabelText('wind effect').textContent).toBe('+8')
    })

    it('max value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 },
        zeroWindValue: null
      })

      expect(getByLabelText('maximum horizontal speed').textContent).toBe('67')
    })

    it('min value', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 },
        zeroWindValue: null
      })

      expect(getByLabelText('minimum horizontal speed').textContent).toBe('45')
    })
  })

  describe('empty values', () => {
    const renderComponent = (props: Props) => {
      return renderWithAllProviders(
        <TrackViewPreferencesProvider initialValues={{ unitSystem: METRIC }}>
          <HorizontalSpeed {...props} />
        </TrackViewPreferencesProvider>
      )
    }

    it('average value - NaN', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 0 / 0, min: 20, max: 30 },
        zeroWindValue: null
      })

      expect(getByLabelText('average horizontal speed').textContent).toBe('---')
    })

    it('min value - null', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: null, max: 30 },
        zeroWindValue: null
      })

      expect(getByLabelText('minimum horizontal speed').textContent).toBe('---')
    })
  })
})
