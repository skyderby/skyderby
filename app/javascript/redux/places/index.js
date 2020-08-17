import { combineReducers } from 'redux'

import { loadCountry, bulkLoadCountries } from 'redux/countries'
import Api from 'api'

import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes'
import allIds from './allIds'
import byId from './byId'
import { selectPlaces, selectPlace } from './selectors'

export const bulkLoadPlaces = ids => async (dispatch, getState) => {
  await Promise.all(ids.map(id => dispatch(loadPlace(id))))

  const countryIds = Array.from(
    new Set(selectPlaces(getState()).map(place => place.countryId))
  )

  await dispatch(bulkLoadCountries(countryIds))
}

export const loadPlace = placeId => async (dispatch, getState) => {
  if (!placeId) return

  const stateData = selectPlace(getState(), placeId)
  const skip = ['loaded', 'loading'].includes(stateData?.status)

  if (skip) return

  dispatch({ type: LOAD_REQUEST, payload: { id: placeId } })

  try {
    const data = await Api.Place.findRecord(placeId)

    dispatch(loadCountry(data.countryId))

    dispatch({ type: LOAD_SUCCESS, payload: data })
  } catch (err) {
    dispatch({ type: LOAD_ERROR, payload: { id: placeId } })

    throw err
  }
}

export * from './selectors'

export default combineReducers({
  allIds,
  byId
})
