import axios from 'axios'
import { combineReducers } from 'redux'

import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes'
import status from './status'
import byId from './byId'
import allIds from './allIds'
import currentPage from './currentPage'
import totalPages from './totalPages'

export const loadTracks = searchParams => {
  return async dispatch => {
    dispatch({ type: LOAD_REQUEST })

    const queryString = Object.entries(searchParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    const dataUrl = ['/api/v1/tracks', queryString].join('?')

    try {
      const { data } = await axios.get(dataUrl)
      dispatch({ type: LOAD_SUCCESS, payload: data })
    } catch (err) {
      dispatch({ type: LOAD_ERROR, payload: err })
    }
  }
}

export * from './selectors'

export default combineReducers({
  status,
  allIds,
  byId,
  currentPage,
  totalPages
})
