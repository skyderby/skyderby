import axios from 'axios'
import { combineReducers } from 'redux'

import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes.js'

import designatedLane from './designatedLane.js'
import discipline from './discipline'
import editable from './editable'
import error from './error'
import event, { loadEvent } from './event'
import groups from './groups'
import isLoaded from './isLoaded'
import isLoading from './isLoading'
import number from './number'
import referencePointAssignments from './referencePointAssignments'
import referencePoints, { loadReferencePoints } from './referencePoints'
import results from './results'
import roundId from './roundId'
import selectedResults, { selectGroup } from './selectedResults'

export { panDlToResult } from './designatedLane'
export { toggleResult, selectGroup } from './selectedResults'
export { updatePenalty } from './results'

export function loadRoundMap(eventId, roundId) {
  return async dispatch => {
    dispatch({ type: LOAD_REQUEST, payload: { eventId, roundId } })

    const dataUrl = `/api/v1/events/${eventId}/rounds/${roundId}`

    try {
      dispatch(loadEvent(eventId))
      dispatch(loadReferencePoints(eventId))

      const { data } = await axios.get(dataUrl)
      dispatch({ type: LOAD_SUCCESS, payload: data })

      const { groups } = data
      if (groups.length > 0) dispatch(selectGroup(groups[0]))
    } catch (err) {
      dispatch({ type: LOAD_ERROR, payload: err })
    }
  }
}

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
