import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'
import track from './track'

const initialState = {}

const byId = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
    case LOAD_SUCCESS:
      return {
        ...state,
        [action.payload.id]: track(state[action.payload.id], action)
      }
    default:
      return state
  }
}

export default byId
