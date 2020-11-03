import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

import countries from 'redux/countries'
import eventRound from 'redux/events/round'
import eventTeams from 'redux/events/teams'
import manufacturers from 'redux/manufacturers'
import places from 'redux/places'
import profiles from 'redux/profiles'
import session from './session'
import suits from 'redux/suits'
import terrainProfiles from 'redux/terrainProfiles'
import tracks from 'redux/tracks'
import userPreferences from 'redux/userPreferences'

import { loadState, saveState } from 'redux/localStorage'

export const rootReducer = combineReducers({
  countries,
  eventRound,
  eventTeams,
  manufacturers,
  places,
  profiles,
  session,
  suits,
  terrainProfiles,
  tracks,
  userPreferences
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const persistedState = loadState()

const store = createStore(
  rootReducer,
  persistedState,
  composeEnhancers(applyMiddleware(thunk))
)

store.subscribe(() => {
  const { countries, manufacturers, userPreferences } = store.getState()

  saveState({
    countries,
    manufacturers,
    userPreferences
  })
})

export default store
