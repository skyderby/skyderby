import { configureStore } from '@reduxjs/toolkit'

import eventRound from 'redux/events/round'
import eventTeams from 'redux/events/teams'
import manufacturers from 'redux/manufacturers'
import session from './session'
import suits from 'redux/suits'
import suitUsageStats from 'redux/suitUsageStats'
import userPreferences from 'redux/userPreferences'

import { loadState, saveState } from 'redux/localStorage'

export const createStore = preloadedState =>
  configureStore({
    reducer: {
      eventRound,
      eventTeams,
      manufacturers,
      session,
      suits,
      suitUsageStats,
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
