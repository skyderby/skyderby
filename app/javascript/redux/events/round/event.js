import client from 'api/client'

const prefix = '[event]'

export const LOAD_REQUEST = `${prefix} LOAD/REQUEST`
export const LOAD_SUCCESS = `${prefix} LOAD/SUCCESS`
export const LOAD_ERROR = `${prefix} LOAD/ERROR`

const initialState = {
  id: undefined,
  name: undefined,
  rangeFrom: undefined,
  rangeTo: undefined
}

export const loadEvent = id => {
  return async dispatch => {
    dispatch({ type: LOAD_REQUEST, payload: { id } })

    const dataUrl = `/api/v1/events/${id}`

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
      return {
        ...initialState,
        id: action.payload
      }
    case LOAD_SUCCESS:
      return {
        ...state,
        ...action.payload
      }
    default:
      return state
  }
}
