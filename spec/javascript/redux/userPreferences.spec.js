import reducer, {
  updatePreferences,
  SINGLE_CHART,
  MULTI_CHART,
  METRIC,
  IMPERIAL
} from 'redux/userPreferences'

describe('userPreferences', () => {
  describe('chartMode reducer', () => {
    it('when dispatched allowed value - update', () => {
      const result = reducer(undefined, updatePreferences({ chartMode: SINGLE_CHART }))

      expect(result.chartMode).toEqual(SINGLE_CHART)
    })

    it('when dispatched invalid value - returns default', () => {
      const result = reducer(undefined, updatePreferences({ chartMode: 'INVALID' }))

      expect(result.chartMode).toEqual(MULTI_CHART)
    })
  })

  describe('chartMode reducer', () => {
    it('when dispatched allowed value - update', () => {
      const result = reducer(undefined, updatePreferences({ unitSystem: IMPERIAL }))

      expect(result.unitSystem).toEqual(IMPERIAL)
    })

    it('when dispatched invalid value - returns default', () => {
      const result = reducer(undefined, updatePreferences({ unitSystem: 'INVALID' }))

      expect(result.unitSystem).toEqual(METRIC)
    })
  })
})
