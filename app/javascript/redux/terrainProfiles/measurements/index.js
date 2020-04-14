import axios from 'axios'
import { combineReducers } from 'redux'

import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'
import byId from './byId'
import allIds from './allIds'

export const loadTerrainProfileMeasurement = terrainProfileId => {
  return async (dispatch, getState) => {
    if (!terrainProfileId) return

    const stateData = getState().terrainProfiles.measurements.byId[terrainProfileId] || {}
    const skip = ['loaded', 'loading'].includes(stateData.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: terrainProfileId } })

    const dataUrl = `/api/v1/terrain_profiles/${terrainProfileId}/measurements`

    try {
      const { data } = await axios.get(dataUrl)

      dispatch({ type: LOAD_SUCCESS, payload: { id: terrainProfileId, items: data } })
    } catch (err) {
      alert(err)
    }
  }
}

export * from './selectors'

export default combineReducers({
  allIds,
  byId
})
