import axios from 'axios'
import { combineReducers } from 'redux'

import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'
import byId from './byId'
import allIds from './allIds'

export const loadTrackResults = trackId => {
  return async (dispatch, getState) => {
    if (!trackId) return

    const stateData = getState().tracks.results.byId[trackId] || {}
    const skip = ['loaded', 'loading'].includes(stateData.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: trackId } })

    const dataUrl = `/api/v1/tracks/${trackId}/results`

    try {
      const { data } = await axios.get(dataUrl)

      dispatch({ type: LOAD_SUCCESS, payload: { id: trackId, ...data } })
    } catch (err) {
      alert(err)
    }
  }
}

export * from './selectors'

export default combineReducers({
  byId,
  allIds
})
