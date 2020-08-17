import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import FlightProfiles from 'components/FlightProfiles'
import { loadTerrainProfiles } from 'redux/terrainProfiles'
import { toggleTrack, selectTerrainProfile } from 'redux/flightProfiles'

const FlightProfilesPage = () => {
  const dispatch = useDispatch()
  const urlParams = Object.fromEntries(new URLSearchParams(useLocation().search))

  const selectedTracks = urlParams['selectedTracks']
    ? urlParams['selectedTracks'].split(',').map(Number)
    : []

  const selectedTerrainProfile =
    urlParams['selectedTerrainProfile'] && Number(urlParams['selectedTerrainProfile'])

  const straightLine = urlParams['straight-line'] === 'true'

  useEffect(() => {
    dispatch(loadTerrainProfiles())

    selectedTracks.forEach(trackId => dispatch(toggleTrack(trackId)))

    if (selectedTerrainProfile) {
      dispatch(selectTerrainProfile(selectedTerrainProfile))
    }
  }, [dispatch, selectedTerrainProfile, selectedTracks, urlParams])

  return (
    <FlightProfiles
      straightLine={straightLine}
      selectedTracks={selectedTracks}
      selectedTerrainProfile={selectedTerrainProfile}
    />
  )
}

export default FlightProfilesPage
