import { createSlice } from '@reduxjs/toolkit'

export const SINGLE_CHART = 'SINGLE'
export const MULTI_CHART = 'SEPARATED'

export const METRIC = 'METRIC'
export const IMPERIAL = 'IMPERIAL'

export const STRAIGHT_LINE = 'STRAIGHT_LINE'
export const TRAJECTORY_DISTANCE = 'TRAJECTORY_DISTANCE'

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState: {
    chartMode: MULTI_CHART,
    unitSystem: METRIC,
    flightProfileDistanceCalculationMethod: TRAJECTORY_DISTANCE
  },
  reducers: {
    updatePreferences(state, action) {
      const {
        chartMode,
        unitSystem,
        flightProfileDistanceCalculationMethod
      } = action.payload

      if ([SINGLE_CHART, MULTI_CHART].includes(chartMode)) state.chartMode = chartMode
      if ([METRIC, IMPERIAL].includes(unitSystem)) state.unitSystem = unitSystem
      if (
        [STRAIGHT_LINE, TRAJECTORY_DISTANCE].includes(
          flightProfileDistanceCalculationMethod
        )
      ) {
        state.flightProfileDistanceCalculationMethod = flightProfileDistanceCalculationMethod
      }
    }
  }
})

export const selectUserPreferences = state => state.userPreferences

export const { updatePreferences } = userPreferencesSlice.actions

export default userPreferencesSlice.reducer
