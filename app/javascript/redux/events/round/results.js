import axios from 'axios'

import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes.js'
import { colorByIndex } from 'utils/colors'

const prefix = '[events/round/results]'
const UPDATE_PENALTY = `${prefix}/UPDATE_PENALTY`

const initialState = []

export function updatePenalty(resultId, penalty) {
  return async (dispatch, getState) => {
    const {
      eventRound: {
        event: { id: eventId }
      }
    } = getState()

    const url = `/api/v1/events/${eventId}/results/${resultId}/penalty`

    try {
      await axios.put(url, {
        penalty: { ...penalty }
      })

      dispatch({ type: UPDATE_PENALTY, payload: { resultId, penalty } })
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
      return action.payload.results.map((el, idx) => ({
        ...el,
        color: colorByIndex(idx)
      }))
    case UPDATE_PENALTY:
      return state.map(result => {
        if (result.id === action.payload.resultId) {
          return { ...result, ...action.payload.penalty }
        }

        return result
      })
    default:
      return state
  }
}
