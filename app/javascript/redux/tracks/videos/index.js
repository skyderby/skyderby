import axios from 'axios'
import { combineReducers } from 'redux'

import {
  LOAD_REQUEST,
  LOAD_SUCCESS,
  LOAD_NO_VIDEO,
  SAVE_REQUEST,
  SAVE_SUCCESS,
  SAVE_ERROR,
  DELETE_REQUEST,
  DELETE_SUCCESS,
  DELETE_ERROR
} from './actionTypes'
import byId from './byId'
import allIds from './allIds'
import { selectTrackVideo } from './selectors'

const videoUrl = trackId => `/api/v1/tracks/${trackId}/video`

export const loadTrackVideo = trackId => {
  return async (dispatch, getState) => {
    if (!trackId) return

    const stateData = selectTrackVideo(getState(), trackId) || {}
    const skip = ['loaded', 'noVideo', 'loading'].includes(stateData.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: trackId } })

    try {
      const { data } = await axios.get(videoUrl(trackId))

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

export const saveTrackVideo = (trackId, trackVideo) => {
  return async dispatch => {
    dispatch({ type: SAVE_REQUEST, payload: { id: trackId } })

    try {
      const { data } = await axios.post(videoUrl(trackId), { trackVideo })
      dispatch({ type: SAVE_SUCCESS, payload: { id: trackId, ...data } })
    } catch (err) {
      dispatch({ type: SAVE_ERROR, payload: { id: trackId } })
      alert(err)
    }
  }
}

export const deleteTrackVideo = trackId => {
  return async dispatch => {
    dispatch({ type: DELETE_REQUEST, payload: { id: trackId } })

    try {
      await axios.delete(videoUrl(trackId))
      dispatch({ type: DELETE_SUCCESS, payload: { id: trackId } })
    } catch (err) {
      dispatch({ type: DELETE_ERROR, payload: { id: trackId } })
      alert(err)
    }
  }
}

export * from './selectors'

export default combineReducers({
  byId,
  allIds
})
