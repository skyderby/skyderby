import { combineReducers } from 'redux'

import Api from 'api'

import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes'
import status from './status'
import byId from './byId'
import allIds from './allIds'
import currentPage from './currentPage'
import totalPages from './totalPages'

export const loadTracks = searchParams => async dispatch => {
  dispatch({ type: LOAD_REQUEST })

  try {
    const data = await Api.Track.findAll(searchParams)

    dispatch({ type: LOAD_SUCCESS, payload: data })
  } catch (err) {
    dispatch({ type: LOAD_ERROR, payload: err })
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
