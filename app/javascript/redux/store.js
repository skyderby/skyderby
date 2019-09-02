import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import eventRounds from 'redux/events/rounds'

const rootReducer = combineReducers({ eventRounds })

export default createStore(rootReducer, applyMiddleware(thunk))
