import { LOAD_SUCCESS } from './actionTypes'

const initialState = {}

const byId = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      return {
        ...state,
        ...Object.fromEntries(action.payload.items.map(el => [el.id, el]))
      }
    default:
      return state
  }
}

export default byId
