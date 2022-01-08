import client from 'api/client'

const prefix = '[events/round/referencePoints]'

const LOAD_REQUEST = `${prefix} LOAD/REQUEST`
const LOAD_SUCCESS = `${prefix} LOAD/SUCCESS`
const LOAD_ERROR = `${prefix} LOAD/ERROR`

const initialState = []

export function loadReferencePoints(eventId) {
  return async dispatch => {
    dispatch({ type: LOAD_REQUEST, eventId })

    const dataUrl = `/api/v1/events/${eventId}/reference_points`

    try {
      const { data } = await client.get(dataUrl)
      dispatch({ type: LOAD_SUCCESS, payload: data })
    } catch (err) {
      dispatch({ type: LOAD_ERROR, payload: err })
    }
  }
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_REQUEST:
    case LOAD_ERROR:
      return [...initialState]
    case LOAD_SUCCESS:
      return action.payload
    default:
      return state
  }
}
