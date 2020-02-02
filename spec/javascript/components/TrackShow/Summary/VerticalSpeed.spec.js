import React from 'react'

import renderWithRedux from 'testHelpers/renderWithRedux'
import { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
import VerticalSpeed from 'components/TrackShow/Summary/VerticalSpeed'

describe('Summary/VerticalSpeed', () => {
  describe('metric units', () => {
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: METRIC } }
      return renderWithRedux(<VerticalSpeed {...props} />, initialState)
    }

    it('average value', () => {
      const { getByTestId } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 }
      })

      expect(getByTestId('value[avg]')).toHaveTextContent('84')
    })

    it('max value', () => {
      const { getByTestId } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 }
      })

      expect(getByTestId('value[max]')).toHaveTextContent('108')
    })

    it('min value', () => {
      const { getByTestId } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 }
      })

      expect(getByTestId('value[min]')).toHaveTextContent('72')
    })
  })

  describe('imperial units', () => {
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: IMPERIAL } }
      return renderWithRedux(<VerticalSpeed {...props} />, initialState)
    }

    it('average value', () => {
      const { getByTestId } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 }
      })

      expect(getByTestId('value[avg]')).toHaveTextContent('52')
    })

    it('max value', () => {
      const { getByTestId } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 }
      })

      expect(getByTestId('value[max]')).toHaveTextContent('67')
    })

    it('min value', () => {
      const { getByTestId } = renderComponent({
        value: { avg: 23.373, min: 20, max: 30 }
      })

      expect(getByTestId('value[min]')).toHaveTextContent('45')
    })
  })

  describe('empty values', () => {
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: METRIC } }
      return renderWithRedux(<VerticalSpeed {...props} />, initialState)
    }

    it('average value - NaN', () => {
      const { getByTestId } = renderComponent({
        value: { avg: 0 / 0, min: 20, max: 30 }
      })

      expect(getByTestId('value[avg]')).toHaveTextContent('---')
    })

    it('max value - undefined', () => {
      const { getByTestId } = renderComponent({
        value: { avg: 23.373, min: 20, max: undefined }
      })

      expect(getByTestId('value[max]')).toHaveTextContent('---')
    })

    it('min value - null', () => {
      const { getByTestId } = renderComponent({
        value: { avg: 23.373, min: null, max: 30 }
      })

      expect(getByTestId('value[min]')).toHaveTextContent('---')
    })
  })
})
