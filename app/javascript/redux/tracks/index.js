import { combineReducers } from 'redux'

import { loadProfile } from 'redux/profiles'
import { loadSuit } from 'redux/suits'
import { loadPlace } from 'redux/places'
import Api from 'api'

import allIds from './allIds'
import byId from './byId'

import points from './points'
import windData from './windData'
import results from './results'
import videos from './videos'

import { selectTrack } from './selectors'

import {
  LOAD_REQUEST,
  LOAD_SUCCESS,
  LOAD_ERROR,
  DELETE_REQUEST,
  DELETE_SUCCESS,
  DELETE_ERROR,
  UPDATE_REQUEST,
  UPDATE_SUCCESS,
  UPDATE_ERROR
} from './actionTypes'
import { LOAD_NO_VIDEO as TRACK_HAS_NO_VIDEO } from './videos/actionTypes'

const loadAssociations = async (dispatch, data) => {
  const { profileId, placeId, suitId } = data

  await Promise.all([
    dispatch(loadProfile(profileId)),
    dispatch(loadSuit(suitId)),
    dispatch(loadPlace(placeId))
  ])
}

export const loadTrack = trackId => {
  return async (dispatch, getState) => {
    const stateData = selectTrack(getState(), trackId) || {}
    const skip = ['loaded', 'loading'].includes(stateData.status)

    if (skip) return stateData

    dispatch({ type: LOAD_REQUEST, payload: { id: trackId } })

    try {
      const data = await Api.Track.findRecord(trackId)

      await loadAssociations(dispatch, data)

      if (!data.hasVideo) dispatch({ type: TRACK_HAS_NO_VIDEO, payload: { id: trackId } })

      dispatch({ type: LOAD_SUCCESS, payload: data })

      return data
    } catch (err) {
      dispatch({ type: LOAD_ERROR, payload: { id: trackId } })

      throw err
    }
  }
}

export const deleteTrack = trackId => {
  return async dispatch => {
    dispatch({ type: DELETE_REQUEST, payload: { id: trackId } })

    try {
      await Api.Track.deleteRecord(trackId)
      dispatch({ type: DELETE_SUCCESS, payload: { id: trackId } })
    } catch (err) {
      dispatch({ type: DELETE_ERROR, payload: { id: trackId } })

      throw err
    }
  }
}

export const updateTrack = (id, values) => {
  return async dispatch => {
    dispatch({ type: UPDATE_REQUEST, payload: { id } })

    try {
      const data = await Api.Track.updateRecord(id, values)

      await loadAssociations(dispatch, data)

      dispatch({ type: UPDATE_SUCCESS, payload: { id, ...data } })

      return data
    } catch (err) {
      dispatch({ type: UPDATE_ERROR, payload: { id } })

      throw err
    }
  }
}

export * from './selectors'

export default combineReducers({
  allIds,
  byId,
  points,
  windData,
  results,
  videos
})
