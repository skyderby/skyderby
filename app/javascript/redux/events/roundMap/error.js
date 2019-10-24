import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes.js'

const initialState = null

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_REQUEST:
    case LOAD_SUCCESS:
      return initialState
    case LOAD_ERROR:
      return action.payload
    default:
      return state
  }
}
