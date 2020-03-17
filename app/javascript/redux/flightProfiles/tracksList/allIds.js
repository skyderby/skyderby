import { LOAD_SUCCESS } from './actionTypes.js'

const initialState = []

export default function(state = initialState, action) {
  switch (action.type) {
    case LOAD_SUCCESS:
      return action.payload.items.map(({ id }) => id)
    default:
      return state
  }
}
