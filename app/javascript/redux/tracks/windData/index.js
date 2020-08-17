import axios from 'axios'
import { combineReducers } from 'redux'

import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes'
import byId from './byId'
import allIds from './allIds'

export const loadTrackWindData = trackId => {
  return async (dispatch, getState) => {
    if (!trackId) return

    const stateData = getState().tracks.windData.byId[trackId] || {}
    const skip = ['loaded', 'loading'].includes(stateData.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: trackId } })

    const dataUrl = `/api/v1/tracks/${trackId}/weather_data`

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
