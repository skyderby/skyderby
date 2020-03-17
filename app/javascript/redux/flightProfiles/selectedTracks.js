import { TOGGLE_TRACK } from './actionTypes'
import { isTrackSelected } from './selectors'
import { loadTrackPoints } from 'redux/tracks/points'

export const toggleTrack = trackId => {
  return async (dispatch, getState) => {
    dispatch({ type: TOGGLE_TRACK, payload: { trackId } })

    const isSelected = isTrackSelected(getState(), trackId)

    if (isSelected) {
      dispatch(loadTrackPoints(trackId))
    }
  }
}

const initialState = []

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case TOGGLE_TRACK:
      if (state.includes(action.payload.trackId)) {
        return state.filter(el => el !== action.payload.trackId)
      } else {
        return [...state, action.payload.trackId]
      }
    default:
      return state
  }
}
