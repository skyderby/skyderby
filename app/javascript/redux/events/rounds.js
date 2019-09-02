const app = 'skyderby'
const module = 'events/rounds'
const prefix = `${app}/${module}`

const LOAD_REQUEST = `${prefix}/LOAD/REQUEST`
const LOAD_SUCCESS = `${prefix}/LOAD/SUCCESS`
const LOAD_ERROR = `${prefix}/LOAD/ERROR`

export function loadRound(eventId, roundId) {
  return dispatch => {
    dispatch({ type: LOAD_REQUEST, payload: { eventId, id: roundId } })

    const dataUrl = `/api/v1/events/${eventId}/rounds/${roundId}`

    const requestOptions = {
      credentials: 'same-origin',
      Accept: 'application/json'
    }

    fetch(dataUrl, requestOptions)
      .then(response => response.json())
      .then(data => dispatch(loadRoundSuccess(data)))
      .catch(error => dispatch(loadRoundError(error)))
  }
}

function loadRoundSuccess(payload) {
  return { type: LOAD_SUCCESS, payload }
}

function loadRoundError(error) {
  return { type: LOAD_ERROR, error }
}

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case LOAD_REQUEST:
      return {
        ...state,
        [`${action.payload.eventId}/${action.payload.id}`]: {
          isLoading: true,
          isLoaded: false,
          error: null
        }
      }
    case LOAD_SUCCESS:
      return {
        ...state,
        [`${action.payload.eventId}/${action.payload.id}`]: {
          isLoading: false,
          isLoaded: true,
          error: null,
          ...action.payload
        }
      }
    default:
      return state
  }
}
