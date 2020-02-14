import React from 'react'

import renderWithRedux from 'testHelpers/renderWithRedux'
import { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
import VerticalSpeed from 'components/TrackInsights/Summary/VerticalSpeed'

describe('Summary/VerticalSpeed', () => {
  describe('metric units', () => {
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: METRIC } }
      return renderWithRedux(<VerticalSpeed {...props} />, initialState)
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
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: IMPERIAL } }
      return renderWithRedux(<VerticalSpeed {...props} />, initialState)
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
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: METRIC } }
      return renderWithRedux(<VerticalSpeed {...props} />, initialState)
    }

    it('average value - NaN', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 0 / 0, min: 20, max: 30 }
      })

      expect(getByLabelText('average vertical speed').textContent).toBe('---')
    })

    it('max value - undefined', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: 20, max: undefined }
      })

      expect(getByLabelText('maximum vertical speed').textContent).toBe('---')
    })

    it('min value - null', () => {
      const { getByLabelText } = renderComponent({
        value: { avg: 23.373, min: null, max: 30 }
      })

      expect(getByLabelText('minimum vertical speed').textContent).toBe('---')
    })
  })
})
