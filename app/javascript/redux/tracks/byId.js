import {
  LOAD_REQUEST,
  LOAD_SUCCESS,
  LOAD_ERROR,
  CREATE_SUCCESS,
  UPDATE_SUCCESS,
  DELETE_SUCCESS
} from './actionTypes'
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
    case LOAD_ERROR:
    case CREATE_SUCCESS:
    case UPDATE_SUCCESS:
    case VIDEO_SAVE:
    case VIDEO_DELETE:
      return {
        ...state,
        [action.payload.id]: track(state[action.payload.id], action)
      }
    case DELETE_SUCCESS:
      return Object.fromEntries(
        Object.entries(state).filter(([id]) => id !== action.payload.id)
      )
    default:
      return state
  }
}

export default byId
