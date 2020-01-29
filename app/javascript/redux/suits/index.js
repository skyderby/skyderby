import axios from 'axios'
import { combineReducers } from 'redux'
import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'

import allIds from './allIds'
import byId from './byId'

export const loadSuit = suitId => {
  if (!suitId) return

  return async (dispatch, getState) => {
    const stateData = getState().suits.byId[suitId] || {}
    const skip = ['loaded', 'loading'].includes(stateData.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: suitId } })

    const dataUrl = `/api/v1/suits/${suitId}`

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
