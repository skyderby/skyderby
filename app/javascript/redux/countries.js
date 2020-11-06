import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit'

import Api from 'api'

const countriesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.name?.localeCompare(b.name)
})

const { selectById: selectCountry } = countriesAdapter.getSelectors(
  state => state.countries
)

const selectIsLoading = (state, profileId) => state.profiles.loading[profileId]

const loadCountriesByIds = createAsyncThunk('countries/bulkLoad', async ids => {
  const data = await Api.Country.pickAll(ids)

  return data
})

export const bulkLoadCountries = ids => async (dispatch, getState) => {
  const state = getState()
  const idsToFetch = ids.filter(id => {
    const recordInStore = selectCountry(state, id)
    const isLoading = selectIsLoading(state, id)

    return !recordInStore && !isLoading
  })

  if (idsToFetch.length === 0) return

  return await dispatch(loadCountriesByIds(idsToFetch))
}

export const loadCountry = createAsyncThunk(
  'countries/load',
  async countryId => {
    const data = await Api.Country.findRecord(countryId)

    return data
  },
  {
    condition: (countryId, { getState }) => {
      if (!countryId) return false

      const state = getState()
      const recordInStore = selectCountry(state, countryId)
      const isLoading = selectIsLoading(state, countryId)

      return !recordInStore && !isLoading
    }
  }
)

const countriesSlice = createSlice({
  name: 'countries',
  initialState: countriesAdapter.getInitialState({ loading: {} }),
  reducers: {},
  extraReducers: {
    [loadCountry.pending]: (state, { meta }) => {
      state.loading[meta.arg] = true
    },
    [loadCountry.fulfilled]: (state, { payload }) => {
      delete state.loading[payload.id]

      countriesAdapter.addOne(state, {
        id: Number(payload.id),
        ...payload
      })
    },
    [loadCountry.rejected]: (state, { meta }) => {
      delete state.loading[meta.arg]
    },
    [bulkLoadCountries.pending]: (state, { meta }) => {
      const { arg: ids } = meta
      ids.forEach(id => (state.loading[id] = true))
    },
    [bulkLoadCountries.fulfilled]: (state, { payload }) => {
      const { items } = payload
      countriesAdapter.addMany(
        state,
        items.map(({ id, ...changes }) => ({
          id: Number(id),
          ...changes
        }))
      )
    },
    [bulkLoadCountries.rejected]: (state, { meta }) => {
      const { arg: ids } = meta
      ids.forEach(id => delete state.loading[id])
    }
  }
})

export { selectCountry }

export default countriesSlice.reducer
