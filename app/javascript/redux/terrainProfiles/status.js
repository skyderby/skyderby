import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes'

const initialState = 'idle'

const status = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
      return 'loading'
    case LOAD_SUCCESS:
      return 'loaded'
    case LOAD_ERROR:
      return 'error'
    default:
      return state
  }
}

export default status