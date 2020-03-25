import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'
import {
  selectedTracksSelector,
  selectedTerrainProfileSelector
} from 'redux/flightProfiles'
import { colorByIndex } from 'utils/colors'
import useChartOptions from './useChartOptions'
import FlightProfile from './FlightProfile'
import TerrainProfile from './TerrainProfile'

const FlightProfilesChart = ({ onZoomChange }) => {
  const options = useChartOptions(onZoomChange)
  const selectedTracks = useSelector(selectedTracksSelector)
  const selectedTerrainProfile = useSelector(selectedTerrainProfileSelector)

  return (
    <Highchart autoResize options={options}>
      {chart => (
        <>
          {selectedTracks.map((trackId, idx) => (
            <FlightProfile
              key={trackId}
              chart={chart}
              trackId={trackId}
              color={colorByIndex(idx)}
            />
          ))}
          {selectedTerrainProfile && (
            <TerrainProfile chart={chart} terrainProfileId={selectedTerrainProfile} />
          )}
        </>
      )}
    </Highchart>
  )
}

FlightProfilesChart.propTypes = {
  onZoomChange: PropTypes.func.isRequired
}

export default FlightProfilesChart
