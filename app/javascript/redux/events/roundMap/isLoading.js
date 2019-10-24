import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes.js'

const initialState = false

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_REQUEST:
      return true
    case LOAD_ERROR:
    case LOAD_SUCCESS:
      return false
    default:
      return state
  }
}
