import React from 'react'
import { useSelector } from 'react-redux'

import Highchart from 'components/Highchart'
import useChartOptions from './useChartOptions'
import FlightProfile from './FlightProfile'
import TerrainProfile from './TerrainProfile'
import {
  selectedTracksSelector,
  selectedTerrainProfileSelector
} from 'redux/flightProfiles'

const FlightProfilesChart = () => {
  const options = useChartOptions()
  const selectedTracks = useSelector(selectedTracksSelector)
  const selectedTerrainProfile = useSelector(selectedTerrainProfileSelector)

  return (
    <Highchart autoResize options={options}>
      {chart => (
        <>
          {selectedTracks.map(trackId => (
            <FlightProfile key={trackId} chart={chart} trackId={trackId} />
          ))}
          {selectedTerrainProfile && (
            <TerrainProfile chart={chart} terrainProfileId={selectedTerrainProfile} />
          )}
        </>
      )}
    </Highchart>
  )
}

export default FlightProfilesChart
