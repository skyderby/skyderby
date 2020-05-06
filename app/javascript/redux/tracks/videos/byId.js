import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_NO_VIDEO } from './actionTypes'
import videoReducer from './video'

const initialState = {}

const byId = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
    case LOAD_NO_VIDEO:
    case LOAD_SUCCESS:
      return {
        ...state,
        [action.payload.id]: videoReducer(state[action.payload.id], action)
      }
    default:
      return state
  }
}

export default byId
