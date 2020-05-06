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

export const loadTrack = trackId => {
  return async (dispatch, getState) => {
    const stateData = getState().tracks.byId[trackId] || {}
    const skip = ['loaded', 'loading'].includes(stateData.status)

    if (skip) return

    dispatch({ type: LOAD_REQUEST, payload: { id: trackId } })

    const dataUrl = `/api/v1/tracks/${trackId}`

    try {
      const { data } = await axios.get(dataUrl)

      const { profileId, placeId, suitId } = data

      await Promise.all([
        dispatch(loadProfile(profileId)),
        dispatch(loadSuit(suitId)),
        dispatch(loadPlace(placeId))
      ])

      dispatch({ type: LOAD_SUCCESS, payload: data })
    } catch (err) {
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
