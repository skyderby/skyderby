import { LOAD_SUCCESS } from './actionTypes'

const initialState = []

const allIds = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      return action.payload.items.map(el => el.id)
    default:
      return state
  }
}

export default allIds
