import axios from 'axios'
import { combineReducers } from 'redux'
import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'

import allIds from './allIds'
import byId from './byId'

export const loadPlace = placeId => {
  if (!placeId) return

  return async (dispatch, getState) => {
    const stateData = getState().places.byId[placeId] || {}
    const skip = ['loaded', 'loading'].includes(stateData.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: placeId } })

    const dataUrl = `/api/v1/places/${placeId}`

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
