import { combineReducers } from 'redux'
import axios from 'axios'

import { loadProfile } from 'redux/profiles'
import { loadSuit } from 'redux/suits'
import { loadPlace } from 'redux/places'

import tracksIndex from './tracksIndex'

import allIds from './allIds'
import byId from './byId'

import points from './points'
import windData from './windData'
import results from './results'
import videos from './videos'

import { LOAD_REQUEST, LOAD_SUCCESS } from './actionTypes'
import {
  DELETE_ERROR,
  DELETE_REQUEST,
  DELETE_SUCCESS,
  LOAD_NO_VIDEO as TRACK_HAS_NO_VIDEO
} from './videos/actionTypes'

const trackUrl = trackId => `/api/v1/tracks/${trackId}`

export const loadTrack = trackId => {
  return async (dispatch, getState) => {
    const stateData = getState().tracks.byId[trackId] || {}
    const skip = ['loaded', 'loading'].includes(stateData.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: trackId } })

    try {
      const { data } = await axios.get(trackUrl(trackId))

      const { profileId, placeId, suitId } = data

      await Promise.all([
        dispatch(loadProfile(profileId)),
        dispatch(loadSuit(suitId)),
        dispatch(loadPlace(placeId))
      ])

      if (!data.hasVideo) dispatch({ type: TRACK_HAS_NO_VIDEO, payload: { id: trackId } })

      dispatch({ type: LOAD_SUCCESS, payload: data })
    } catch (err) {
      alert(err)
    }
  }
}

export const deleteTrack = trackId => {
  return async dispatch => {
    dispatch({ type: DELETE_REQUEST, payload: { id: trackId } })

    try {
      await axios.delete(trackUrl(trackId))
      dispatch({ type: DELETE_SUCCESS, payload: { id: trackId } })
    } catch (err) {
      dispatch({ type: DELETE_ERROR, payload: { id: trackId } })
      alert(err)
    }
  }
}

export * from './selectors'

export default combineReducers({
  tracksIndex,
  allIds,
  byId,
  points,
  windData,
  results,
  videos
})
