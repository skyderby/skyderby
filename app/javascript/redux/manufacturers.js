import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit'

import Api from 'api'
import depaginate from 'utils/depaginate'

const makesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.name?.localeCompare(b.name)
})

export const {
  selectById: selectManufacturer,
  selectAll: selectAllManufacturers
} = makesAdapter.getSelectors(state => state.manufacturers)

export const createManufacturerSelector = id => state => selectManufacturer(state, id)

export const loadManufacturer = createAsyncThunk(
  'makes/load',
  async makeId => {
    const data = await Api.Manufacturer.findRecord(makeId)

    return data
  },
  {
    condition: (makeId, { getState }) => {
      if (!makeId) return false

      const stateData = selectManufacturer(getState(), makeId)
      if (['loaded', 'loading'].includes(stateData?.status)) return false

      return true
    }
  }
)

export const loadAllManufacturers = createAsyncThunk('makes/loadAll', async () => {
  const responses = await depaginate(Api.Manufacturer)
  const allItems = responses.map(chunk => chunk.items).flat()

  return allItems
})

const makesSlice = createSlice({
  name: 'makes',
  initialState: makesAdapter.getInitialState(),
  reducers: {},
  extraReducers: {
    [loadManufacturer.pending]: (state, { meta }) => {
      const { arg: id } = meta
      makesAdapter.upsertOne(state, { id: Number(id), status: 'loading' })
    },
    [loadManufacturer.fulfilled]: (state, { payload }) => {
      const { id, ...changes } = payload
      makesAdapter.updateOne(state, {
        id: Number(id),
        changes: { ...changes, status: 'loaded' }
      })
    },
    [loadManufacturer.rejected]: (state, { meta }) => {
      const { arg: id } = meta
      makesAdapter.updateOne(state, { id: Number(id), changes: { status: 'error' } })
    },
    [loadAllManufacturers.fulfilled]: (state, { payload: items }) => {
      makesAdapter.setAll(
        state,
        items.map(({ id, ...rest }) => ({
          id: Number(id),
          status: 'loaded',
          ...rest
        }))
      )
    }
  }
})

export default makesSlice.reducer
