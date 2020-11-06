import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit'

import Api from 'api'

const measurementsAdapter = createEntityAdapter()

export const { selectById: selectMeasurement } = measurementsAdapter.getSelectors(
  state => state.terrainProfileMeasurements
)

export const createMeasurementsSelector = terrainProfileId => state =>
  selectMeasurement(state, terrainProfileId)

const selectIsLoading = (state, terrainProfileId) =>
  state.terrainProfileMeasurements.loading[terrainProfileId]

export const loadTerrainProfileMeasurement = createAsyncThunk(
  'terrainProfileMeasurement/load',
  async terrainProfileId =>
    await Api.TerrainProfileMeasurements.findAll(terrainProfileId),
  {
    condition: (terrainProfileId, { getState }) => {
      if (!terrainProfileId) return false

      const state = getState()
      const recordInStore = selectMeasurement(state, terrainProfileId)
      const isLoading = selectIsLoading(state, terrainProfileId)

      return !recordInStore && !isLoading
    }
  }
)

const measurementsSlice = createSlice({
  name: 'terrainProfileMeasurements',
  initialState: measurementsAdapter.getInitialState({ loading: {} }),
  reducers: {},
  extraReducers: {
    [loadTerrainProfileMeasurement.pending]: (state, { meta }) => {
      state.loading[meta.arg] = true
    },
    [loadTerrainProfileMeasurement.fulfilled]: (state, { payload, meta }) => {
      delete state.loading[meta.arg]

      const records = payload.map(record => ({
        ...record,
        altitude: Number(record.altitude),
        distance: Number(record.distance)
      }))

      measurementsAdapter.addOne(state, { id: meta.arg, records })
    },
    [loadTerrainProfileMeasurement.rejected]: (state, { meta }) => {
      delete state.loading[meta.arg]
    }
  }
})

export default measurementsSlice.reducer
