import { configureStore } from '@reduxjs/toolkit'

import eventTeams from 'redux/events/teams'

export const createStore = preloadedState =>
  configureStore({
    reducer: {
      eventTeams
    },
    preloadedState
  })

const store = createStore()

export default store
