import React from 'react'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'
import { colorByIndex } from 'utils/colors'
import useChartOptions from './useChartOptions'
import FlightProfile from './FlightProfile'
import TerrainProfile from './TerrainProfile'

const FlightProfilesChart = ({
  selectedTracks,
  selectedTerrainProfile,
  straightLine,
  onZoomChange
}) => {
  const options = useChartOptions(onZoomChange)

  return (
    <Highchart autoResize options={options}>
      {chart => (
        <>
          {selectedTracks.map((trackId, idx) => (
            <FlightProfile
              key={trackId}
              chart={chart}
              trackId={trackId}
              straightLine={straightLine}
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
  onZoomChange: PropTypes.func.isRequired,
  selectedTracks: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedTerrainProfile: PropTypes.number,
  straightLine: PropTypes.bool.isRequired
}

export default FlightProfilesChart
