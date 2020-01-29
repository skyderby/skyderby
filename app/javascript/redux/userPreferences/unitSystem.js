import { UPDATE_PREFERENCES } from './actionTypes'

export const METRIC = 'METRIC'
export const IMPERIAL = 'IMPERIAL'

const possibleValues = [METRIC, IMPERIAL]

const initialState = METRIC

export default (state = initialState, action = {}) => {
  const { payload: { unitSystem } = {} } = action

  switch (action.type) {
    case UPDATE_PREFERENCES:
      return possibleValues.includes(unitSystem) ? unitSystem : state
    default:
      return state
  }
}
