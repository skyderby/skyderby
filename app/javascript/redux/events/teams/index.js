import client from 'api/client'
import { combineReducers } from 'redux'

import { getCSRFToken } from 'utils/csrfToken'
import {
  LOAD_REQUEST,
  LOAD_SUCCESS,
  LOAD_ERROR,
  TEAM_CREATED,
  TEAM_UPDATED,
  TEAM_DELETED
} from './actionTypes.js'

import allIds from './allIds'
import byId from './byId'

export const loadTeams = eventId => {
  return async dispatch => {
    dispatch({ type: LOAD_REQUEST })

    const dataUrl = `/api/v1/events/${eventId}/teams`

    try {
      const { data } = await client.get(dataUrl)
      dispatch({ type: LOAD_SUCCESS, payload: data })
    } catch (err) {
      dispatch({ type: LOAD_ERROR, payload: err })
    }
  }
}

export const createTeam = (eventId, input) => {
  return async dispatch => {
    const dataUrl = `/api/v1/events/${eventId}/teams`

    try {
      const { data } = await client.post(dataUrl, input, {
        headers: {
          'X-CSRF-Token': getCSRFToken()
        }
      })

      dispatch({ type: TEAM_CREATED, payload: data })
    } catch (err) {
      alert(err)
    }
  }
}

export const updateTeam = (eventId, teamId, input) => {
  return async dispatch => {
    const dataUrl = `/api/v1/events/${eventId}/teams/${teamId}`

    try {
      const { data } = await client.patch(dataUrl, input, {
        headers: {
          'X-CSRF-Token': getCSRFToken()
        }
      })

      dispatch({ type: TEAM_UPDATED, payload: data })
    } catch (err) {
      alert(err)
    }
  }
}

export const deleteTeam = (eventId, teamId) => {
  return async dispatch => {
    const dataUrl = `/api/v1/events/${eventId}/teams/${teamId}`

    try {
      await client.delete(dataUrl, {
        headers: {
          'X-CSRF-Token': getCSRFToken()
        }
      })

      dispatch({ type: TEAM_DELETED, payload: { id: teamId } })
    } catch (err) {
      alert(err)
    }
  }
}

export default combineReducers({
  allIds,
  byId
})
