import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'

const initialState = {
  status: 'idle',
  items: []
}

const normalizeData = el => ({
  actualOn: Date.parse(el.actualOn),
  altitude: Number(el.altitude),
  windSpeed: Number(el.windSpeed),
  windDirection: Number(el.windDirection)
})

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
        items: action.payload.items.map(normalizeData),
        status: 'loaded'
      }
    default:
      return state
  }
}

export default windData
