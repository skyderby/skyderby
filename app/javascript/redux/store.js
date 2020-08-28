import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

import countries from 'redux/countries'
import eventRound from 'redux/events/round'
import eventTeams from 'redux/events/teams'
import places from 'redux/places'
import profiles from 'redux/profiles'
import suits from 'redux/suits'
import terrainProfiles from 'redux/terrainProfiles'
import tracks from 'redux/tracks'
import userPreferences from 'redux/userPreferences'

import { loadState, saveState } from 'redux/localStorage'

export const rootReducer = combineReducers({
  countries,
  eventRound,
  eventTeams,
  places,
  profiles,
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
  const { countries, userPreferences } = store.getState()

  saveState({
    countries,
    userPreferences
  })
})

export default store
