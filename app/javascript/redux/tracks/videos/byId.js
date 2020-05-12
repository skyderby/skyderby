import {
  LOAD_REQUEST,
  LOAD_SUCCESS,
  LOAD_NO_VIDEO,
  SAVE_REQUEST,
  SAVE_SUCCESS,
  SAVE_ERROR,
  DELETE_REQUEST,
  DELETE_SUCCESS,
  DELETE_ERROR
} from './actionTypes'
import videoReducer from './video'

const initialState = {}

const byId = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
    case LOAD_NO_VIDEO:
    case LOAD_SUCCESS:
    case SAVE_REQUEST:
    case SAVE_SUCCESS:
    case SAVE_ERROR:
    case DELETE_REQUEST:
    case DELETE_SUCCESS:
    case DELETE_ERROR:
      return {
        ...state,
        [action.payload.id]: videoReducer(state[action.payload.id], action)
      }
    default:
      return state
  }
}

export default byId
