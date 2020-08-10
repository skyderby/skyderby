import { LOAD_SUCCESS, CREATE_SUCCESS } from './actionTypes'

const initialState = []

const allIds = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SUCCESS:
    case CREATE_SUCCESS:
      return [...state, action.payload.id]
    default:
      return state
  }
}

export default allIds
