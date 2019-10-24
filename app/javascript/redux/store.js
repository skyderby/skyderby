import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'

import eventRoundMap from 'redux/events/roundMap'

const rootReducer = combineReducers({ eventRoundMap })

export default createStore(rootReducer, applyMiddleware(thunk, logger))
