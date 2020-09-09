import { combineReducers } from 'redux'

import Api from 'api'
import depaginate from 'utils/depaginate'
import { loadManufacturer, loadAllManufacturers } from 'redux/manufacturers'

import {
  LOAD_REQUEST,
  LOAD_SUCCESS,
  LOAD_ERROR,
  LOAD_ALL_REQUEST,
  LOAD_ALL_SUCCESS,
  LOAD_ALL_ERROR
} from './actionTypes'
import allIds from './allIds'
import byId from './byId'
import usageStats from './usageStats'

export const loadSuit = suitId => {
  return async (dispatch, getState) => {
    if (!suitId) return

    const stateData = getState().suits.byId[suitId]
    const skip = ['loaded', 'loading'].includes(stateData?.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: suitId } })

    try {
      const data = await Api.Suit.findRecord(suitId)

      await dispatch(loadManufacturer(data.makeId))

      dispatch({ type: LOAD_SUCCESS, payload: data })

      return data
    } catch (err) {
      dispatch({ type: LOAD_ERROR, payload: { id: suitId } })

      throw err
    }
  }
}

export const loadAllSuits = () => {
  return async dispatch => {
    dispatch({ type: LOAD_ALL_REQUEST })

    try {
      const responses = await depaginate(Api.Suit)

      const allItems = responses.reduce((acc, chunk) => acc.concat(chunk.items), [])

      await dispatch(loadAllManufacturers())

      dispatch({ type: LOAD_ALL_SUCCESS, payload: { items: allItems } })
    } catch (err) {
      dispatch({ type: LOAD_ALL_ERROR })

      throw err
    }
  }
}

export * from './selectors'

export default combineReducers({
  allIds,
  byId,
  usageStats
})
