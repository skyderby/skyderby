import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit'

import Api from 'api'
import { bulkLoadPlaces, selectPlace } from 'redux/places'
import { selectCountry } from 'redux/countries'

const terrainProfilesAdapter = createEntityAdapter()

const { selectById, selectAll } = terrainProfilesAdapter.getSelectors(
  state => state.terrainProfiles
)

const withAssociations = (state, terrainProfile) => {
  if (!terrainProfile) return null

  const place = selectPlace(state, terrainProfile.placeId)
  const country = selectCountry(state, place.countryId)

  return {
    ...terrainProfile,
    place,
    country
  }
}

export const selectAllTerrainProfiles = state => {
  const terrainProfiles = selectAll(state)

  return terrainProfiles.map(item => withAssociations(state, item))
}

export const selectTerrainProfile = (state, id) => {
  const terrainProfile = selectById(state, id)

  return withAssociations(state, terrainProfile)
}

export const createTerrainProfileSelector = terrainProfileId => state =>
  selectTerrainProfile(state, terrainProfileId)

export const loadTerrainProfiles = createAsyncThunk(
  'terrainProfile/loadAll',
  async (_arg, { dispatch }) => {
    const terrainProfiles = await Api.TerrainProfile.findAll()

    const placeIds = Array.from(new Set(terrainProfiles.items.map(el => el.placeId)))
    await dispatch(bulkLoadPlaces(placeIds))

    return terrainProfiles
  },
  {
    condition: (_arg, { getState }) => {
      const state = getState()
      return !['loading', 'loaded'].includes(state.terrainProfiles.loadingStatus)
    }
  }
)

const terrainProfilesSlice = createSlice({
  name: 'terrainProfiles',
  initialState: terrainProfilesAdapter.getInitialState({ loadingStatus: 'idle' }),
  reducers: {},
  extraReducers: {
    [loadTerrainProfiles.pending]: state => {
      state.loadingStatus = 'loading'
    },
    [loadTerrainProfiles.fulfilled]: (state, { payload }) => {
      const { items } = payload
      terrainProfilesAdapter.setAll(state, items)
    },
    [loadTerrainProfiles.rejected]: state => {
      state.loadingStatus = 'idle'
    }
  }
})

export default terrainProfilesSlice.reducer
