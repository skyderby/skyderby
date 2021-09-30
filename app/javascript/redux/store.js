import { configureStore } from '@reduxjs/toolkit'

import eventRound from 'redux/events/round'
import eventTeams from 'redux/events/teams'

export const createStore = preloadedState =>
  configureStore({
    reducer: {
      eventRound,
      eventTeams
    },
    preloadedState
  })

const store = createStore()

export default store
