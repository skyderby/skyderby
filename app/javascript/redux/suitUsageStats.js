import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import Api from 'api'

const suitUsageStatsAdapter = createEntityAdapter()

export const {
  selectById: selectUsageStats,
  selectEntities: selectUsageStatsEntities
} = suitUsageStatsAdapter.getSelectors(state => state.suitUsageStats)

const loadFilteredUsageStats = createAsyncThunk(
  'suitUsageStats/load',
  async idsToFetch => {
    const data = await Api.Suit.Stats.findAll(idsToFetch)
    return data
  }
)

export const loadUsageStats = ids => async (dispatch, getState) => {
  const state = getState()
  const idsToFetch = ids.filter(id => {
    const recordInStore = selectUsageStats(state, id)
    return !recordInStore && !state.suitUsageStats.loading[id]
  })

  if (idsToFetch.length === 0) return

  return await dispatch(loadFilteredUsageStats(idsToFetch))
}

const suitUsageStatsSlice = createSlice({
  name: 'suitUsageStats',
  initialState: suitUsageStatsAdapter.getInitialState({ loading: {} }),
  reducers: {},
  extraReducers: {
    [loadUsageStats.pending]: (state, { meta }) => {
      const { arg: ids } = meta
      ids.forEach(id => (state.loading[id] = true))
    },
    [loadUsageStats.fulfilled]: (state, { payload, meta }) => {
      const { arg: ids } = meta
      const { items } = payload
      suitUsageStatsAdapter.upsertMany(state, items)
      ids.forEach(id => delete state.loading[id])
    },
    [loadUsageStats.rejected]: (state, { meta }) => {
      const { arg: ids } = meta
      ids.forEach(id => delete state.loading[id])
    }
  }
})

export default suitUsageStatsSlice.reducer
