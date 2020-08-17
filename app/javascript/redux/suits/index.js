import Api from 'api'
import { combineReducers } from 'redux'

import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes'
import allIds from './allIds'
import byId from './byId'

export const loadSuit = suitId => {
  return async (dispatch, getState) => {
    if (!suitId) return

    const stateData = getState().suits.byId[suitId]
    const skip = ['loaded', 'loading'].includes(stateData?.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: suitId } })

    try {
      const data = await Api.Suit.findRecord(suitId)
      dispatch({ type: LOAD_SUCCESS, payload: data })
    } catch (err) {
      dispatch({ type: LOAD_ERROR, payload: { id: suitId } })

      throw err
    }
  }
}

export * from './selectors'

export default combineReducers({
  allIds,
  byId
})
