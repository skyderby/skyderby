import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import { createSelector } from 'reselect'

import Api from 'api'
import depaginate from 'utils/depaginate'
import {
  loadManufacturer,
  loadAllManufacturers,
  selectManufacturer
} from 'redux/manufacturers'

const suitsAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.name?.localeCompare(b.name)
})

const { selectById, selectAll } = suitsAdapter.getSelectors(state => state.suits)

export const selectSuit = (state, suitId) => {
  const suit = selectById(state, suitId)
  if (!suit) return null

  const make = selectManufacturer(state, suit.makeId)
  return { ...suit, make }
}

export const selectAllSuits = state => {
  const suits = selectAll(state)
  return suits.map(suit => ({ ...suit, make: selectManufacturer(state, suit.makeId) }))
}

export const createSuitSelector = suitId => state => selectSuit(state, suitId)

export const createSuitsByMakeSelector = makeId =>
  createSelector([selectAllSuits], suits =>
    suits.filter(el => el.makeId === makeId).sort((a, b) => a.name.localeCompare(b.name))
  )

export const loadSuit = createAsyncThunk(
  'suits/load',
  async (suitId, { dispatch }) => {
    const data = await Api.Suit.findRecord(suitId)
    await dispatch(loadManufacturer(data.makeId))
    return data
  },
  {
    condition: (suitId, { getState }) => {
      if (!suitId) return false

      const stateData = selectById(getState(), suitId)
      if (['loaded', 'loading'].includes(stateData?.status)) return false

      return true
    }
  }
)

export const loadAllSuits = createAsyncThunk(
  'suits/loadAll',
  async (_arg, { dispatch }) => {
    const [responses] = await Promise.all([
      depaginate(Api.Suit),
      dispatch(loadAllManufacturers())
    ])

    const allItems = responses.map(chunk => chunk.items).flat()
    return allItems
  }
)

const makesSlice = createSlice({
  name: 'makes',
  initialState: suitsAdapter.getInitialState(),
  reducers: {},
  extraReducers: {
    [loadSuit.pending]: (state, { meta }) => {
      const { arg: id } = meta
      suitsAdapter.upsertOne(state, { id: Number(id), status: 'loading' })
    },
    [loadSuit.fulfilled]: (state, { payload }) => {
      const { id, ...changes } = payload
      suitsAdapter.updateOne(state, {
        id: Number(id),
        changes: { ...changes, status: 'loaded' }
      })
    },
    [loadSuit.rejected]: (state, { meta }) => {
      const { arg: id } = meta
      suitsAdapter.updateOne(state, { id: Number(id), changes: { status: 'error' } })
    },
    [loadAllSuits.fulfilled]: (state, { payload: items }) => {
      suitsAdapter.setAll(
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
