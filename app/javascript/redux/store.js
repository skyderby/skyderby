import { configureStore } from '@reduxjs/toolkit'

import countries from 'redux/countries'
import eventRound from 'redux/events/round'
import eventTeams from 'redux/events/teams'
import manufacturers from 'redux/manufacturers'
import places from 'redux/places'
import profiles from 'redux/profiles'
import session from './session'
import suits from 'redux/suits'
import suitUsageStats from 'redux/suitUsageStats'
import terrainProfiles from 'redux/terrainProfiles'
import terrainProfileMeasurements from 'redux/terrainProfileMeasurements'
import tracks from 'redux/tracks'
import userPreferences from 'redux/userPreferences'

import { loadState, saveState } from 'redux/localStorage'

export const createStore = preloadedState =>
  configureStore({
    reducer: {
      countries,
      eventRound,
      eventTeams,
      manufacturers,
      places,
      profiles,
      session,
      suits,
      suitUsageStats,
      terrainProfiles,
      terrainProfileMeasurements,
      tracks,
      userPreferences
    },
    preloadedState
  })

const persistedState = loadState()
const store = createStore(persistedState)

store.subscribe(() => {
  const { countries, manufacturers, userPreferences } = store.getState()

  saveState({
    countries,
    manufacturers,
    userPreferences
  })
})

export default store
