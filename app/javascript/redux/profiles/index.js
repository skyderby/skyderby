import axios from 'axios'
import { combineReducers } from 'redux'
import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'

import allIds from './allIds'
import byId from './byId'

export const loadProfile = profileId => {
  if (!profileId) return

  return async (dispatch, getState) => {
    const stateData = getState().profiles.byId[profileId] || {}
    const skip = ['loaded', 'loading'].includes(stateData.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: profileId } })

    const dataUrl = `/api/v1/profiles/${profileId}`

    try {
      const { data } = await axios.get(dataUrl)
      dispatch({ type: LOAD_SUCCESS, payload: data })
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
