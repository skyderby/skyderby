import axios from 'axios'
import colors from 'utils/colors'

const app = 'skyderby'
const module = 'events/roundMap'
const prefix = `${app}/${module}`

const LOAD_REQUEST = `${prefix}/LOAD/REQUEST`
const LOAD_SUCCESS = `${prefix}/LOAD/SUCCESS`
const LOAD_ERROR = `${prefix}/LOAD/ERROR`

const SELECT_GROUP = `${prefix}/SELECT_GROUP`
const TOGGLE_RESULT = `${prefix}/TOGGLE_RESULT`

const ASSIGN_REFERENCE_POINT = `${prefix}/ASSIGN_REFERENCE_POINT`

const UPDATE_PENALTY = `${prefix}/UPDATE_PENALTY`

const UPDATE_DL = `${prefix}/PAN_DL_TO_RESULT`

const DEFAULT_STATE = {
  editable: false,
  eventId: undefined,
  roundId: undefined,
  groups: [],
  results: [],
  selectedResults: [],
  designatedLane: {
    enabled: false,
    startPoint: undefined,
    endPoint: undefined
  },
  referencePointAssignments: [],
  isLoading: false,
  isLoaded: true,
  error: null
}

export function loadRoundMap(eventId, roundId) {
  return async dispatch => {
    dispatch({ type: LOAD_REQUEST, payload: { eventId, roundId } })

    const dataUrl = `/api/v1/events/${eventId}/rounds/${roundId}`

    try {
      const { data } = await axios.get(dataUrl)
      dispatch(loadRoundSuccess(data))
    } catch (err) {
      dispatch(loadRoundError(err))
    }
  }
}

export function selectGroup(resultIds) {
  return { type: SELECT_GROUP, payload: resultIds }
}

export function toggleResult(resultId) {
  return { type: TOGGLE_RESULT, payload: resultId }
}

export function assignReferencePoint(competitorId, referencePointId) {
  return async (dispatch, getState) => {
    const {
      eventRoundMap: { eventId, roundId }
    } = getState()

    const url = `/api/v1/events/${eventId}/rounds/${roundId}/reference_point_assignments`

    try {
      await axios.post(url, {
        competitor_id: competitorId,
        reference_point_id: referencePointId
      })

      dispatch({
        type: ASSIGN_REFERENCE_POINT,
        payload: {
          competitorId,
          referencePointId
        }
      })
    } catch (err) {
      alert(err)
    }
  }
}

export function updatePenalty(resultId, penalty) {
  return async (dispatch, getState) => {
    const {
      eventRoundMap: { eventId }
    } = getState()

    const url = `/api/v1/events/${eventId}/results/${resultId}/penalty`

    try {
      await axios.put(url, {
        penalty: { ...penalty }
      })

      dispatch({ type: UPDATE_PENALTY, payload: { resultId, penalty } })
    } catch (err) {
      alert(err)
    }
  }
}

export function panDlToResult(resultId) {
  return async (dispatch, getState) => {
    dispatch({
      type: UPDATE_DL,
      payload: { enabled: false, startPoint: undefined, endPoint: undefined }
    })

    const {
      eventRoundMap: { results, referencePointAssignments, eventId }
    } = getState()
    const { afterExitPoint, competitorId } = results.find(el => el.id === resultId)
    const { eventReferencePoints } = getState()
    const referencePoints = eventReferencePoints[eventId].items

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

function loadRoundSuccess(payload) {
  return { type: LOAD_SUCCESS, payload }
}

function loadRoundError(error) {
  return { type: LOAD_ERROR, error }
}

function colorByIndex(idx) {
  return colors[idx % (colors.length - 1)]
}

export default function reducer(state = DEFAULT_STATE, action = {}) {
  switch (action.type) {
    case LOAD_REQUEST:
      return {
        ...state,
        ...action.payload,
        isLoading: true,
        isLoaded: false,
        error: null
      }
    case LOAD_SUCCESS:
      return {
        ...state,
        ...action.payload,
        results: action.payload.results.map((el, idx) => ({
          ...el,
          color: colorByIndex(idx)
        })),
        selectedResults: action.payload.groups[0] || [],
        isLoading: false,
        isLoaded: true,
        error: null
      }
    case LOAD_ERROR:
      return {
        ...state,
        isLoading: false,
        isLoaded: false,
        error: action.error
      }
    case SELECT_GROUP:
      return {
        ...state,
        selectedResults: action.payload
      }
    case TOGGLE_RESULT:
      if (state.selectedResults.find(el => el === action.payload)) {
        return {
          ...state,
          selectedResults: state.selectedResults.filter(el => el !== action.payload)
        }
      } else {
        return {
          ...state,
          selectedResults: [...state.selectedResults, action.payload]
        }
      }
    case ASSIGN_REFERENCE_POINT:
      return {
        ...state,
        referencePointAssignments: [
          ...state.referencePointAssignments.filter(
            el => el.competitorId !== action.payload.competitorId
          ),
          action.payload
        ]
      }
    case UPDATE_PENALTY:
      return {
        ...state,
        results: state.results.map(result => {
          if (result.id === action.payload.resultId) {
            return {
              ...result,
              ...action.payload.penalty
            }
          }

          return result
        })
      }
    case UPDATE_DL:
      return {
        ...state,
        designatedLane: action.payload
      }
    default:
      return state
  }
}
