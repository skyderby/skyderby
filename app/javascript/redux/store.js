import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'

import eventRoundMap from 'redux/events/roundMap'
import eventReferencePoints from 'redux/events/referencePoints'

const rootReducer = combineReducers({ eventRoundMap, eventReferencePoints })

export default createStore(rootReducer, applyMiddleware(thunk, logger))
