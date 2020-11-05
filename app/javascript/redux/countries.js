import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit'

import Api from 'api'

const countriesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.name?.localeCompare(b.name)
})

const { selectById: selectCountry } = countriesAdapter.getSelectors(
  state => state.countries
)

const loadCountriesByIds = createAsyncThunk('countries/bulkLoad', async ids => {
  const data = await Api.Country.pickAll(ids)

  return data
})

export const bulkLoadCountries = ids => async (dispatch, getState) => {
  const state = getState()
  const idsToFetch = ids.filter(id => {
    const recordInStore = selectCountry(state, id)
    return !['loaded', 'loading'].includes(recordInStore?.status)
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

      const stateData = selectCountry(getState(), countryId)
      if (['loaded', 'loading'].includes(stateData?.status)) return false

      return true
    }
  }
)

const countriesSlice = createSlice({
  name: 'countries',
  initialState: countriesAdapter.getInitialState(),
  reducers: {},
  extraReducers: {
    [loadCountry.pending]: (state, { meta }) => {
      const { arg: id } = meta
      countriesAdapter.upsertOne(state, { id: Number(id), status: 'loading' })
    },
    [loadCountry.fulfilled]: (state, { payload }) => {
      const { id, ...changes } = payload
      countriesAdapter.updateOne(state, {
        id: Number(id),
        changes: { ...changes, status: 'loaded' }
      })
    },
    [loadCountry.rejected]: (state, { meta }) => {
      const { arg: id } = meta
      countriesAdapter.updateOne(state, { id: Number(id), changes: { status: 'error' } })
    },
    [bulkLoadCountries.pending]: (state, { meta }) => {
      const { arg: ids } = meta
      countriesAdapter.upsertMany(
        state,
        ids.map(id => ({ id: Number(id), status: 'loading' }))
      )
    },
    [bulkLoadCountries.fulfilled]: (state, { payload }) => {
      const { items } = payload
      countriesAdapter.updateMany(
        state,
        items.map(({ id, ...changes }) => ({
          id: Number(id),
          changes: { ...changes, status: 'loaded' }
        }))
      )
    },
    [bulkLoadCountries.rejected]: (state, { meta }) => {
      const { arg: ids } = meta
      countriesAdapter.updateMany(
        state,
        ids.map(id => ({ id: Number(id), changes: { status: 'error' } }))
      )
    }
  }
})

export { selectCountry }

export default countriesSlice.reducer
