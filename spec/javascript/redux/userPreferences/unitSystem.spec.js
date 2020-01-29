import reducer, { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
import { UPDATE_PREFERENCES } from 'redux/userPreferences/actionTypes'

describe('chartMode reducer', () => {
  it('when dispatched allowed value - update', () => {
    const result = reducer(
      undefined,
      { type: UPDATE_PREFERENCES, payload: { unitSystem: IMPERIAL } }
    )

    expect(result).toEqual(IMPERIAL)
  })

  it('when dispatched invalid value - returns default', () => {
    const result = reducer(
      undefined,
      { type: UPDATE_PREFERENCES, payload: { unitSystem: 'INVALID' } }
    )

    expect(result).toEqual(METRIC)
  })
})
