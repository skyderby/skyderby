import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'

const initialState = {
  status: 'idle',
  items: []
}

const windData = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
      return {
        ...state,
        status: 'loading'
      }
    case LOAD_SUCCESS:
      return {
        ...state,
        items: action.payload.items,
        status: 'loaded'
      }
    default:
      return state
  }
}

export default windData
