import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'
import {
  DELETE_SUCCESS as VIDEO_DELETE,
  SAVE_SUCCESS as VIDEO_SAVE
} from './videos/actionTypes'

const initialState = null

const track = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
      return {
        ...state,
        status: 'loading'
      }
    case LOAD_SUCCESS:
      return {
        ...state,
        ...action.payload,
        status: 'loaded'
      }
    case VIDEO_SAVE:
      return {
        ...state,
        hasVideo: true
      }
    case VIDEO_DELETE:
      return {
        ...state,
        hasVideo: false
      }
    default:
      return state
  }
}

export default track
