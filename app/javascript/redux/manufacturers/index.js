import { combineReducers } from 'redux'

import Api from 'api'
import depaginate from 'utils/depaginate'

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
import { selectManufacturer } from './selectors'

export const loadManufacturer = manufacturerId => {
  return async (dispatch, getState) => {
    if (!manufacturerId) return

    const stateData = selectManufacturer(getState(), manufacturerId)
    const skip = ['loaded', 'loading'].includes(stateData?.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: manufacturerId } })

    try {
      const data = await Api.Manufacturer.findRecord(manufacturerId)
      dispatch({ type: LOAD_SUCCESS, payload: data })
    } catch (err) {
      dispatch({ type: LOAD_ERROR, payload: { id: manufacturerId } })

      throw err
    }
  }
}

export const loadAllManufacturers = () => {
  return async dispatch => {
    dispatch({ type: LOAD_ALL_REQUEST })

    try {
      const responses = await depaginate(Api.Manufacturer)

      const allItems = responses.reduce((acc, chunk) => acc.concat(chunk.items), [])

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
  byId
})
