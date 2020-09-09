import { LOAD_SUCCESS, LOAD_ALL_SUCCESS } from './actionTypes'

const initialState = []

const allIds = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      return [...state, action.payload.id]
    case LOAD_ALL_SUCCESS:
      return action.payload.items.map(el => el.id)
    default:
      return state
  }
}

export default allIds
