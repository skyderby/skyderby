import { LOAD_SUCCESS } from './actionTypes'

const initialState = 1

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      return action.payload.currentPage
    default:
      return state
  }
}
