import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'

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
    default:
      return state
  }
}

export default track
