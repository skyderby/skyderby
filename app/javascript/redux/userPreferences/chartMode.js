import { UPDATE_PREFERENCES } from './actionTypes'

export const SINGLE_CHART = 'SINGLE'
export const MULTI_CHART = 'SEPARATED'

const possibleValues = [SINGLE_CHART, MULTI_CHART]

const initialState = MULTI_CHART

export default (state = initialState, action = {}) => {
  const { payload: { chartMode } = {} } = action

  switch (action.type) {
    case UPDATE_PREFERENCES:
      return possibleValues.includes(chartMode) ? chartMode : state
    default:
      return state
  }
}
