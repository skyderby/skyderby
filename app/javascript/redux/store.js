import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

import eventRound from 'redux/events/round'
import eventTeams from 'redux/events/teams'
import tracks from 'redux/tracks'

const rootReducer = combineReducers({ eventRound, eventTeams, tracks })

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)))
