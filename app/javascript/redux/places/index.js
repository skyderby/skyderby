import axios from 'axios'
import { combineReducers } from 'redux'

import { bulkLoadCountries } from 'redux/countries'

import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes'
import allIds from './allIds'
import byId from './byId'
import { selectPlaces, selectPlace } from './selectors'

export const bulkLoadPlaces = ids => {
  return async (dispatch, getState) => {
    await Promise.all(ids.map(id => dispatch(loadPlace(id))))

    const countryIds = Array.from(new Set(selectPlaces(getState()).map(place => place.countryId)))

    await dispatch(bulkLoadCountries(countryIds))
  }
}

export const loadPlace = placeId => {
  if (!placeId) return

  return async (dispatch, getState) => {
    const stateData = selectPlace(getState(), placeId)
    const skip = ['loaded', 'loading'].includes(stateData?.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: placeId } })

    const dataUrl = `/api/v1/places/${placeId}`

    try {
      const { data } = await axios.get(dataUrl)
      dispatch({ type: LOAD_SUCCESS, payload: data })
    } catch (err) {
      dispatch({ type: LOAD_ERROR, payload: { id: placeId } })
      alert(err)
    }
  }
}

export * from './selectors'

export default combineReducers({
  allIds,
  byId
})
