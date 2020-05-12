import { LOAD_SUCCESS } from './actionTypes'

const initialState = null

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      return action.payload.totalPages
    default:
      return state
  }
}
