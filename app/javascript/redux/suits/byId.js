import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ALL_SUCCESS } from './actionTypes'
import suit from './suit'

const initialState = {}

const byId = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
    case LOAD_SUCCESS:
      return {
        ...state,
        [action.payload.id]: suit(state[action.payload.id], action)
      }
    case LOAD_ALL_SUCCESS:
      return Object.fromEntries(
        action.payload.items.map(el => [el.id, { ...el, status: 'loaded' }])
      )
    default:
      return state
  }
}

export default byId
