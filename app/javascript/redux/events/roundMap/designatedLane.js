const prefix = '[events/roundMap/designatedLane]'

const UPDATE_DL = `${prefix} UPDATE`
const RESET_DL = `${prefix} RESET`

const initialState = {
  enabled: false,
  startPoint: undefined,
  endPoint: undefined
}

export function panDlToResult(resultId) {
  return async (dispatch, getState) => {
    dispatch({ type: RESET_DL })

    const {
      eventRoundMap: { results, referencePoints, referencePointAssignments }
    } = getState()
    const { afterExitPoint, competitorId } = results.find(el => el.id === resultId)

    const referencePointAssignment = referencePointAssignments.find(
      el => el.competitorId === competitorId
    )
    const referencePoint = referencePoints.find(
      el => el.id === referencePointAssignment.referencePointId
    )

    // setTimeout is a workaround to reset state in DesignatedLane component
    setTimeout(() =>
      dispatch({
        type: UPDATE_DL,
        payload: { enabled: true, startPoint: afterExitPoint, endPoint: referencePoint }
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
