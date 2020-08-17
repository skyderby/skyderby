import axios from 'axios'
import { combineReducers } from 'redux'

import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes'
import byId from './byId'
import allIds from './allIds'

export const loadTrackPoints = trackId => {
  if (!trackId) return

  return async (dispatch, getState) => {
    const stateData = getState().tracks.points.byId[trackId] || {}
    const skip = ['loaded', 'loading'].includes(stateData.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: trackId } })

    const dataUrl = `/api/v1/tracks/${trackId}/points`

    try {
      const { data } = await axios.get(dataUrl)

      dispatch({ type: LOAD_SUCCESS, payload: { id: trackId, items: data } })
    } catch (err) {
      dispatch({ type: LOAD_ERROR, payload: { id: trackId } })

      throw err
    }
  }
}

export * from './selectors'

export default combineReducers({
  byId,
  allIds
})
