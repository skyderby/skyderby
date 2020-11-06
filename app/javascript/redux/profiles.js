import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit'

import Api from 'api'

const profilesAdapter = createEntityAdapter()

export const { selectById: selectProfile } = profilesAdapter.getSelectors(
  state => state.profiles
)

export const createProfileSelector = profileId => state => selectProfile(state, profileId)

export const selectProfilePhoto = (state, profileId) => {
  const profile = selectProfile(state, profileId)

  return profile?.photo || {}
}

const selectIsLoading = (state, profileId) => state.profiles.loading[profileId]

export const loadProfile = createAsyncThunk(
  'profiles/load',
  async id => await Api.Profile.findRecord(id),
  {
    condition: (profileId, { getState }) => {
      if (!profileId) return false

      const state = getState()
      const recordInStore = selectProfile(state, profileId)
      const isLoading = selectIsLoading(state, profileId)

      return !recordInStore && !isLoading
    }
  }
)

const profilesSlice = createSlice({
  name: 'profiles',
  initialState: profilesAdapter.getInitialState({ loading: {} }),
  reducers: {},
  extraReducers: {
    [loadProfile.pending]: (state, { meta }) => {
      state.loading[meta.arg] = true
    },
    [loadProfile.fulfilled]: (state, { payload }) => {
      delete state.loading[payload.id]
      profilesAdapter.addOne(state, payload)
    },
    [loadProfile.rejected]: (state, { meta }) => {
      delete state.loading[meta.arg]
    }
  }
})

export default profilesSlice.reducer
