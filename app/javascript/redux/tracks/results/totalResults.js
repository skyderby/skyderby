import { LOAD_SUCCESS } from './actionTypes'

const initialState = []

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      return action.payload.totalResults
    default:
      return state
  }
}
