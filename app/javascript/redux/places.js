import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit'

import Api from 'api'
import { loadCountry, bulkLoadCountries, selectCountry } from 'redux/countries'

const placesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.name?.localeCompare(b.name)
})

const { selectById, selectAll } = placesAdapter.getSelectors(state => state.places)

const selectIsLoading = (state, placeId) => state.places.loading[placeId]

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

const loadPlacesByIds = createAsyncThunk('places/bulkLoad', async (ids, { dispatch }) => {
  const data = await Api.Place.pickAll(ids)

  const countryIds = data.items.map(el => el.countryId)
  await dispatch(bulkLoadCountries(countryIds))

  return data
})

export const bulkLoadPlaces = ids => async (dispatch, getState) => {
  const state = getState()
  const idsToFetch = ids.filter(id => {
    const recordInStore = selectPlace(state, id)
    const isLoading = selectIsLoading(state, id)

    return !recordInStore && !isLoading
  })

  if (idsToFetch.length === 0) return

  return await dispatch(loadPlacesByIds(idsToFetch))
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
    },
    [loadPlacesByIds.pending]: (state, { meta }) => {
      const { arg: ids } = meta
      ids.forEach(id => (state.loading[id] = true))
    },
    [loadPlacesByIds.fulfilled]: (state, { payload }) => {
      const { items } = payload
      placesAdapter.addMany(
        state,
        items.map(({ id, ...changes }) => ({
          id: Number(id),
          ...changes
        }))
      )
    },
    [loadPlacesByIds.rejected]: (state, { meta }) => {
      const { arg: ids } = meta
      ids.forEach(id => delete state.loading[id])
    }
  }
})

export default placesSlice.reducer
