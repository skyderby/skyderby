import reducer, { SINGLE_CHART, MULTI_CHART } from 'redux/userPreferences/chartMode'
import { UPDATE_PREFERENCES } from 'redux/userPreferences/actionTypes'

describe('chartMode reducer', () => {
  it('when dispatched allowed value - update', () => {
    const result = reducer(
      undefined,
      { type: UPDATE_PREFERENCES, payload: { chartMode: SINGLE_CHART } }
    )

    expect(result).toEqual(SINGLE_CHART)
  })

  it('when dispatched invalid value - returns default', () => {
    const result = reducer(
      undefined,
      { type: UPDATE_PREFERENCES, payload: { chartMode: 'INVALID' } }
    )

    expect(result).toEqual(MULTI_CHART)
  })
})
