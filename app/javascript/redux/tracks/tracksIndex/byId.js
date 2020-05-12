import { LOAD_SUCCESS } from './actionTypes'

const initialState = []

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      return action.payload.items.reduce((acc, track) => {
        acc[track.id] = track
        return acc
      }, {})
    default:
      return state
  }
}
