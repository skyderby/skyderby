import React, { useState, useEffect, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import isEqual from 'lodash.isequal'
import PropTypes from 'prop-types'

import { PageParams } from 'api/FlightProfiles'
import AppShell from 'components/AppShell'
import FlightProfiles from 'components/FlightProfiles'
import useTracksApi from 'hooks/useTracksApi'
import { loadTrack } from 'redux/tracks'
import { loadTrackPoints } from 'redux/tracks/points'
import { loadTerrainProfileMeasurement } from 'redux/terrainProfileMeasurements'

const FlightProfilesPage = ({ location }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const [params, setParams] = useState(() => PageParams.extractFromUrl(location.search))

  useEffect(() => {
    const parsedParams = PageParams.extractFromUrl(location.search)

    if (isEqual(params, parsedParams)) return

    setParams(parsedParams)
  }, [params, setParams, location.search])

  const { tracks, loadMoreTracks } = useTracksApi({
    ...params.tracksParams,
    activity: 'base'
  })

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

      return PageParams.mapToUrl(mergedParams)
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

  return (
    <AppShell fullScreen>
      <FlightProfiles
        tracks={tracks}
        loadMoreTracks={loadMoreTracks}
        updateFilters={updateFilters}
        setSelectedTerrainProfile={setSelectedTerrainProfile}
        toggleTrack={toggleTrack}
        {...params}
      />
    </AppShell>
  )
}

FlightProfilesPage.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
    pathname: PropTypes.string
  }).isRequired
}

export default FlightProfilesPage
