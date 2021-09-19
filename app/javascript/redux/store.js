import { configureStore } from '@reduxjs/toolkit'

import eventRound from 'redux/events/round'
import eventTeams from 'redux/events/teams'
import manufacturers from 'redux/manufacturers'
import suits from 'redux/suits'
import suitUsageStats from 'redux/suitUsageStats'

export const createStore = preloadedState =>
  configureStore({
    reducer: {
      eventRound,
      eventTeams,
      manufacturers,
      suits,
      suitUsageStats
    },
    preloadedState
  })

const store = createStore()

export default store
