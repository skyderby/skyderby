import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'

const normalizeData = el => ({
  ...el,
  altitude: Number(el.altitude),
  distance: Number(el.distance)
})

const initialState = {
  status: 'idle',
  items: []
}

const measurementsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
      return {
        ...state,
        status: 'loading'
      }
    case LOAD_SUCCESS:
      return {
        ...state,
        items: action.payload.items.map(normalizeData),
        status: 'loaded'
      }
    default:
      return state
  }
}

export default measurementsReducer
