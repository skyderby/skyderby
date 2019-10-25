const prefix = '[events/roundMap/designatedLane]'

const UPDATE_DL = `${prefix} UPDATE`
const RESET_DL = `${prefix} RESET`

const initialState = {
  enabled: false,
  startPoint: undefined,
  endPoint: undefined,
  laneViolation: undefined
}

export function updateDL({ enabled, startPoint, endPoint, laneViolation }) {
  return async dispatch => {
    dispatch({ type: RESET_DL })

    if (!enabled) return

    // setTimeout is a workaround to reset state in DesignatedLane component
    setTimeout(() =>
      dispatch({
        type: UPDATE_DL,
        payload: { enabled, startPoint, endPoint, laneViolation }
      })
    )
  }
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE_DL:
      return {
        ...state,
        ...action.payload
      }
    case RESET_DL:
      return {
        ...initialState
      }
    default:
      return state
  }
}
