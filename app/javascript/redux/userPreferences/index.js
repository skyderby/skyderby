import { combineReducers } from 'redux'

import { UPDATE_PREFERENCES } from './actionTypes'
import chartMode from './chartMode'
import unitSystem from './unitSystem'

export const updatePreferences = values => {
  return { type: UPDATE_PREFERENCES, payload: values }
}

export default combineReducers({
  chartMode,
  unitSystem
})
