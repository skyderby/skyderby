import axios from 'axios'
import { combineReducers } from 'redux'

import byId from './byId'
import allIds from './allIds'
import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_NO_VIDEO } from './actionTypes'

export const loadTrackVideo = trackId => {
  return async (dispatch, getState) => {
    if (!trackId) return

    const stateData = getState().tracks.videos.byId[trackId] || {}
    const skip = ['loaded', 'noVideo', 'loading'].includes(stateData.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: trackId } })

    const dataUrl = `/api/v1/tracks/${trackId}/video`

    try {
      const { data } = await axios.get(dataUrl)

      dispatch({ type: LOAD_SUCCESS, payload: { id: trackId, ...data } })
    } catch (err) {
      if (err.response?.status === 404) {
        dispatch({ type: LOAD_NO_VIDEO, payload: { id: trackId } })
      } else {
        alert(err)
      }
    }
  }
}

export * from './selectors'

export default combineReducers({
  byId,
  allIds
})
