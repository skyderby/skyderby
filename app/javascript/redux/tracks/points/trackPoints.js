import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'

const normalizeData = el => ({
  ...el,
  gpsTime: Date.parse(el.gpsTime),
  latitude: Number(el.latitude),
  longitude: Number(el.longitude)
})

const initialState = {
  status: 'idle',
  items: []
}

const trackPoints = (state = initialState, action) => {
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

export default trackPoints
