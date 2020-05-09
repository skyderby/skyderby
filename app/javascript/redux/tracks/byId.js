import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'
import {
  DELETE_SUCCESS as VIDEO_DELETE,
  SAVE_SUCCESS as VIDEO_SAVE
} from './videos/actionTypes'
import track from './track'

const initialState = {}

const byId = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
    case LOAD_SUCCESS:
    case VIDEO_SAVE:
    case VIDEO_DELETE:
      return {
        ...state,
        [action.payload.id]: track(state[action.payload.id], action)
      }
    default:
      return state
  }
}

export default byId
