import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit'

import Api from 'api'

const countriesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.name.localeCompare(b.name)
})

const { selectById: selectCountry } = countriesAdapter.getSelectors(
  state => state.countries
)

export const bulkLoadCountries = ids => async dispatch => {
  await Promise.all(ids.map(id => dispatch(loadCountry(id))))
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
      countriesAdapter.updateOne(state, { id: Number(id), changes, status: 'loaded' })
    },
    [loadCountry.rejected]: (state, { meta }) => {
      const { arg: id } = meta
      countriesAdapter.updateOne(state, { id: Number(id), status: 'error' })
    }
  }
})

export { selectCountry }

export default countriesSlice.reducer
