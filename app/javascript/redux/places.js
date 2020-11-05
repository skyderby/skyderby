import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit'

import Api from 'api'
import { loadCountry, bulkLoadCountries, selectCountry } from 'redux/countries'

const placesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.name.localeCompare(b.name)
})

const { selectById, selectAll } = placesAdapter.getSelectors(state => state.places)

export const selectPlace = (state, placeId) => {
  const place = selectById(state, placeId)

  if (!place) return null

  const country = selectCountry(state, place.countryId)

  return { ...place, country }
}

export const selectPlaces = state => {
  const places = selectAll(state)
  return places.map(place => ({
    ...place,
    country: selectCountry(state, place.countryId)
  }))
}

export const createPlaceSelector = placeId => state => selectPlace(state, placeId)

export const bulkLoadPlaces = ids => async (dispatch, getState) => {
  await Promise.all(ids.map(id => dispatch(loadPlace(id))))

  const countryIds = Array.from(
    new Set(selectAll(getState()).map(place => place.countryId))
  )

  await dispatch(bulkLoadCountries(countryIds))
}

export const loadPlace = createAsyncThunk(
  'places/load',
  async (placeId, { dispatch }) => {
    const data = await Api.Place.findRecord(placeId)

    await dispatch(loadCountry(data.countryId))

    return data
  },
  {
    condition: (placeId, { getState }) => {
      if (!placeId) return false

      const stateData = selectById(getState(), placeId)
      if (['loaded', 'loading'].includes(stateData?.status)) return false

      return true
    }
  }
)

const placesSlice = createSlice({
  name: 'places',
  initialState: placesAdapter.getInitialState(),
  reducers: {},
  extraReducers: {
    [loadPlace.pending]: (state, { meta }) => {
      const { arg: id } = meta
      placesAdapter.upsertOne(state, { id: Number(id), status: 'loading' })
    },
    [loadPlace.fulfilled]: (state, { payload }) => {
      const { id, ...changes } = payload
      placesAdapter.updateOne(state, { id: Number(id), changes, status: 'loaded' })
    },
    [loadPlace.rejected]: (state, { meta }) => {
      const { arg: id } = meta
      placesAdapter.updateOne(state, { id: Number(id), status: 'error' })
    }
  }
})

export default placesSlice.reducer
