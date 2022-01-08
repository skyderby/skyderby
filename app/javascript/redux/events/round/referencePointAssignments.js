import client from 'api/client'

import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes.js'

const prefix = '[events/round/referencePointAssignments]'
const ASSIGN_REFERENCE_POINT = `${prefix} ASSIGN`

const initialState = []

export function assignReferencePoint(competitorId, referencePointId) {
  return async (dispatch, getState) => {
    const {
      eventRound: {
        event: { id: eventId },
        roundId
      }
    } = getState()

    const url = `/api/v1/events/${eventId}/rounds/${roundId}/reference_point_assignments`

    try {
      await client.post(url, {
        competitor_id: competitorId,
        reference_point_id: referencePointId
      })

      dispatch({
        type: ASSIGN_REFERENCE_POINT,
        payload: {
          competitorId,
          referencePointId
        }
      })
    } catch (err) {
      alert(err)
    }
  }
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_REQUEST:
    case LOAD_ERROR:
      return initialState
    case LOAD_SUCCESS:
      return action.payload.referencePointAssignments
    case ASSIGN_REFERENCE_POINT:
      return [
        ...state.filter(el => el.competitorId !== action.payload.competitorId),
        action.payload
      ]
    default:
      return state
  }
}
