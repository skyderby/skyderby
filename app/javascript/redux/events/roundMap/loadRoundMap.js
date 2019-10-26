import axios from 'axios'

import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes.js'
import { loadEvent } from './event'
import { loadReferencePoints } from './referencePoints'
import { selectGroup } from './selectedResults'

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
