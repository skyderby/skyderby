import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_NO_VIDEO } from './actionTypes'

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
    case LOAD_NO_VIDEO:
      return {
        status: 'noVideo'
      }
    case LOAD_SUCCESS:
      return {
        ...normalizeData(action.payload),
        status: 'loaded'
      }
    default:
      return state
  }
}

export default video
