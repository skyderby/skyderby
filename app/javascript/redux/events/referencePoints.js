import axios from 'axios'

const app = 'skyderby'
const module = 'events/referencePoints'
const prefix = `${app}/${module}`

const LOAD_REQUEST = `${prefix}/LOAD/REQUEST`
const LOAD_SUCCESS = `${prefix}/LOAD/SUCCESS`
const LOAD_ERROR = `${prefix}/LOAD/ERROR`

export function loadReferencePoints(eventId) {
  return async dispatch => {
    dispatch({ type: LOAD_REQUEST, eventId })

    const dataUrl = `/api/v1/events/${eventId}/reference_points`

    try {
      const { data } = await axios.get(dataUrl)
      dispatch(loadReferencePointsSuccess(eventId, data))
    } catch (err) {
      dispatch(loadReferencePointsError(eventId, err))
    }
  }
}

function loadReferencePointsSuccess(eventId, payload) {
  return { type: LOAD_SUCCESS, eventId, payload }
}

function loadReferencePointsError(eventId, error) {
  return { type: LOAD_ERROR, eventId, error }
}

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case LOAD_REQUEST:
      return {
        ...state,
        [action.eventId]: {
          items: [],
          isLoading: true,
          isLoaded: false,
          error: null
        }
      }
    case LOAD_SUCCESS:
      return {
        ...state,
        [action.eventId]: {
          items: action.payload,
          isLoading: false,
          isLoaded: true,
          error: null
        }
      }
    case LOAD_ERROR:
      return {
        ...state,
        [action.eventId]: {
          items: [],
          isLoading: false,
          isLoaded: false,
          error: action.error
        }
      }
    default:
      return state
  }
}
