import { configureStore } from '@reduxjs/toolkit'

import eventRound from 'redux/events/round'
import eventTeams from 'redux/events/teams'
import manufacturers from 'redux/manufacturers'
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
      suits,
      suitUsageStats,
      userPreferences
    },
    preloadedState
  })

const persistedState = loadState()
const store = createStore(persistedState)

store.subscribe(() => {
  const { userPreferences } = store.getState()

  saveState({
    userPreferences
  })
})

export default store
