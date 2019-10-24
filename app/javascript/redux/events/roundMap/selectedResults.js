const prefix = '[events/roundMap/selectedResults]'

const SELECT_GROUP = `${prefix} SELECT_GROUP`
const TOGGLE_RESULT = `${prefix} TOGGLE_RESULT`

const initialState = []

export const toggleResult = resultId => {
  return dispatch => dispatch({ type: TOGGLE_RESULT, payload: resultId })
}

export const selectGroup = resultIds => {
  return dispatch => dispatch({ type: SELECT_GROUP, payload: resultIds })
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SELECT_GROUP:
      return action.payload
    case TOGGLE_RESULT:
      if (state.find(el => el === action.payload)) {
        return state.filter(el => el !== action.payload)
      } else {
        return [...state, action.payload]
      }
    default:
      return state
  }
}
