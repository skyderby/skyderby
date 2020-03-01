import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'

const IDLE = 'idle'
const LOADING = 'loading'
const LOADED = 'loaded'

const initialState = IDLE

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case LOAD_REQUEST:
      return LOADING
    case LOAD_SUCCESS:
      return LOADED
    default:
      return state
  }
}
