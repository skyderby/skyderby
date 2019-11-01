import { combineReducers } from 'redux'

import designatedLane from './designatedLane.js'
import discipline from './discipline'
import editable from './editable'
import error from './error'
import event from './event'
import groups from './groups'
import isLoaded from './isLoaded'
import isLoading from './isLoading'
import number from './number'
import referencePointAssignments from './referencePointAssignments'
import referencePoints from './referencePoints'
import results from './results'
import roundId from './roundId'
import selectedResults from './selectedResults'

export { toggleResult, selectGroup } from './selectedResults'
export { updatePenalty } from './results'
export { showDlForResult } from './showDlForResult'
export { loadRoundMap } from './loadRoundMap'

export default combineReducers({
  designatedLane,
  discipline,
  editable,
  error,
  event,
  groups,
  isLoaded,
  isLoading,
  number,
  referencePointAssignments,
  referencePoints,
  results,
  roundId,
  selectedResults
})
