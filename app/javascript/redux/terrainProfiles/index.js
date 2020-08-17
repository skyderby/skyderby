import axios from 'axios'
import { combineReducers } from 'redux'

import { bulkLoadPlaces } from 'redux/places'
import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes'
import allIds from './allIds'
import byId from './byId'
import status from './status'
import measurements from './measurements'

export const loadTerrainProfiles = () => {
  return async dispatch => {
    const dataUrl = '/api/v1/terrain_profiles'

    dispatch({ type: LOAD_REQUEST })

    try {
      const { data } = await axios.get(dataUrl)

      const placeIds = Array.from(new Set(data.items.map(el => el.placeId)))
      await dispatch(bulkLoadPlaces(placeIds))

      dispatch({ type: LOAD_SUCCESS, payload: data })
    } catch (err) {
      dispatch({ type: LOAD_ERROR, payload: {} })

      throw err
    }
  }
}

export * from './selectors'

export default combineReducers({
  allIds,
  byId,
  status,
  measurements
})
