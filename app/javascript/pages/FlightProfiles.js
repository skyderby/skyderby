import React, { useState, useEffect, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { IndexParams } from 'api/Track'
import { PageContext } from 'components/PageContext'
import FlightProfiles from 'components/FlightProfiles'
import { loadTerrainProfiles } from 'redux/terrainProfiles'
import { loadTrack } from 'redux/tracks'
import { loadTrackPoints } from 'redux/tracks/points'
import { loadTerrainProfileMeasurement } from 'redux/terrainProfiles/measurements'

const extractFromUrl = search => {
  const tracksParams = {
    ...IndexParams.extractFromUrl(search, 'tracks'),
    activity: 'base'
  }
  const urlParams = new URLSearchParams(search)

  const selectedTracks = urlParams.get('selectedTracks')
    ? urlParams.get('selectedTracks').split(',').map(Number)
    : []

  const selectedTerrainProfile =
    urlParams.get('selectedTerrainProfile') &&
    Number(urlParams.get('selectedTerrainProfile'))

  const straightLine = urlParams.get('straight-line') === 'true'

  return { tracksParams, selectedTracks, selectedTerrainProfile, straightLine }
}

const mapToUrl = params => {
  const { activity, ...mergedTracksParams } = params.tracksParams
  const tracksParams = IndexParams.mapToUrl(mergedTracksParams, 'tracks')

  const urlParams = new URLSearchParams(tracksParams)

  if (params.selectedTracks.length > 0) {
    urlParams.set('selectedTracks', params.selectedTracks.join(','))
  }

  if (params.selectedTerrainProfile) {
    urlParams.set('selectedTerrainProfile', params.selectedTerrainProfile)
  }

  return urlParams.toString() === '' ? '' : '?' + urlParams.toString()
}

const FlightProfilesPage = ({ location }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const [params, setParams] = useState(() => extractFromUrl(location.search))

  useEffect(() => {
    const parsedParams = extractFromUrl(location.search)

    if (JSON.stringify(params) === JSON.stringify(parsedParams)) return

    setParams(parsedParams)
  }, [params, setParams, location.search])

  const buildUrl = useCallback(
    newParams => {
      const mergedParams = {
        ...params,
        ...newParams,
        tracksParams: {
          ...params.tracksParams,
          ...newParams.tracksParams
        }
      }

      return mapToUrl(mergedParams)
    },
    [params]
  )

  const updateFilters = useCallback(
    filters =>
      history.replace(`${location.pathname}${buildUrl({ tracksParams: { filters } })}`),
    [buildUrl, history, location.pathname]
  )

  const setSelectedTerrainProfile = useCallback(
    selectedTerrainProfile =>
      history.replace(`${location.pathname}${buildUrl({ selectedTerrainProfile })}`),
    [buildUrl, history, location.pathname]
  )

  const toggleTrack = useCallback(
    trackId => {
      const trackSelected = params.selectedTracks.includes(trackId)
      const selectedTracks = trackSelected
        ? params.selectedTracks.filter(el => el !== trackId)
        : [...params.selectedTracks, trackId]

      history.replace(`${location.pathname}${buildUrl({ selectedTracks })}`)
    },
    [params, buildUrl, history, location.pathname]
  )

  useEffect(() => {
    dispatch(loadTerrainProfiles())
  }, [dispatch])

  useEffect(() => {
    params.selectedTracks.map(async id => {
      dispatch(loadTrack(id))
      dispatch(loadTrackPoints(id))
    })
  }, [dispatch, params.selectedTracks])

  useEffect(() => {
    if (!params.selectedTerrainProfile) return

    dispatch(loadTerrainProfileMeasurement(params.selectedTerrainProfile))
  }, [dispatch, params.selectedTerrainProfile])
  return (
    <PageContext
      value={{
        ...params,
        updateFilters,
        setSelectedTerrainProfile,
        toggleTrack
      }}
    >
      <FlightProfiles />
    </PageContext>
  )
}

FlightProfilesPage.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
    pathname: PropTypes.string
  }).isRequired
}

export default FlightProfilesPage
