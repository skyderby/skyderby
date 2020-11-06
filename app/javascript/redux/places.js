import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit'

import Api from 'api'
import { loadCountry, bulkLoadCountries, selectCountry } from 'redux/countries'

const placesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.name?.localeCompare(b.name)
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

const selectIsLoading = (state, placeId) => state.places.loading[placeId]

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

      const state = getState()
      const recordInStore = selectById(state, placeId)
      const isLoading = selectIsLoading(state, placeId)

      return !recordInStore && !isLoading
    }
  }
)

const placesSlice = createSlice({
  name: 'places',
  initialState: placesAdapter.getInitialState({ loading: {} }),
  reducers: {},
  extraReducers: {
    [loadPlace.pending]: (state, { meta }) => {
      state.loading[meta.arg] = true
    },
    [loadPlace.fulfilled]: (state, { payload }) => {
      delete state.loading[payload.id]

      placesAdapter.addOne(state, {
        id: Number(payload.id),
        ...payload
      })
    },
    [loadPlace.rejected]: (state, { meta }) => {
      delete state.loading[meta.arg]
    }
  }
})

export default placesSlice.reducer
