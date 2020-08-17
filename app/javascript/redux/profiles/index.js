import { combineReducers } from 'redux'

import Api from 'api'

import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes'
import allIds from './allIds'
import byId from './byId'

export const loadProfile = profileId => async (dispatch, getState) => {
  if (!profileId) return

  const stateData = getState().profiles.byId[profileId] || {}
  const skip = ['loaded', 'loading'].includes(stateData.status)

  if (skip) return

  dispatch({ type: LOAD_REQUEST, payload: { id: profileId } })

  try {
    const data = await Api.Profile.findRecord(profileId)
    dispatch({ type: LOAD_SUCCESS, payload: data })
  } catch (err) {
    dispatch({ type: LOAD_ERROR, payload: { id: profileId } })

    throw err
  }
}

export * from './selectors'

export default combineReducers({
  allIds,
  byId
})
