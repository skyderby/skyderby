import {
  LOAD_REQUEST,
  LOAD_SUCCESS,
  LOAD_NO_VIDEO,
  DELETE_REQUEST,
  DELETE_SUCCESS,
  DELETE_ERROR,
  SAVE_SUCCESS,
  SAVE_REQUEST,
  SAVE_ERROR
} from './actionTypes'

const initialState = null

const normalizeData = el => ({
  ...el,
  videoOffset: Number(el.videoOffset),
  trackOffset: Number(el.trackOffset)
})

const video = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
      return {
        status: 'loading'
      }
    case DELETE_REQUEST:
      return {
        ...state,
        status: 'deleting'
      }
    case SAVE_REQUEST:
      return {
        ...state,
        status: 'saving'
      }
    case LOAD_NO_VIDEO:
    case DELETE_SUCCESS:
      return {
        status: 'noVideo'
      }
    case LOAD_SUCCESS:
    case SAVE_SUCCESS:
      return {
        ...normalizeData(action.payload),
        status: 'loaded'
      }
    case SAVE_ERROR:
    case DELETE_ERROR:
      return {
        ...state,
        status: 'loaded'
      }
    default:
      return state
  }
}

export default video
