import { createSlice } from '@reduxjs/toolkit'

export const SINGLE_CHART = 'SINGLE'
export const MULTI_CHART = 'SEPARATED'

export const METRIC = 'METRIC'
export const IMPERIAL = 'IMPERIAL'

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState: { chartMode: MULTI_CHART, unitSystem: METRIC },
  reducers: {
    updatePreferences(state, action) {
      const { chartMode, unitSystem } = action.payload

      if ([SINGLE_CHART, MULTI_CHART].includes(chartMode)) state.chartMode = chartMode
      if ([METRIC, IMPERIAL].includes(unitSystem)) state.unitSystem = unitSystem
    }
  }
})

export const selectUserPreferences = state => state.userPreferences

export const { updatePreferences } = userPreferencesSlice.actions

export default userPreferencesSlice.reducer
