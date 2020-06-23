import { combineReducers } from 'redux'

import Api from 'api'

import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'
import allIds from './allIds'
import byId from './byId'

export const bulkLoadCountries = ids => async dispatch => {
  await Promise.all(ids.map(id => dispatch(loadCountry(id))))
}

export const loadCountry = countryId => async (dispatch, getState) => {
  if (!countryId) return

  const stateData = getState().countries.byId[countryId]
  const skip = ['loaded', 'loading'].includes(stateData?.status)

  if (skip) return

  dispatch({ type: LOAD_REQUEST, payload: { id: countryId } })

  try {
    const data = await Api.Country.findRecord(countryId)
    dispatch({ type: LOAD_SUCCESS, payload: data })
  } catch (err) {
    alert(err)
  }
}

export * from './selectors'

export default combineReducers({
  allIds,
  byId
})
