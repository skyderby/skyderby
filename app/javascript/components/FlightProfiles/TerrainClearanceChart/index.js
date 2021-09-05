import React from 'react'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'

import { colorByIndex } from 'utils/colors'
import useChartOptions from './useChartOptions'
import PlaceholderChart from './PlaceholderChart'
import TerrainClearance from './TerrainClearance'

const TerrainClearanceChart = ({
  selectedTracks,
  selectedTerrainProfile,
  straightLine,
  zoomLevel
}) => {
  const options = useChartOptions(zoomLevel)

  if (!selectedTerrainProfile) {
    return <PlaceholderChart text={'Select terrain profile to view this chart'} />
  }

  return (
    <Highchart autoResize options={options}>
      {chart => (
        <>
          <Highchart.Series chart={chart} data={[]} />
          {selectedTracks.map((trackId, idx) => (
            <TerrainClearance
              key={trackId}
              chart={chart}
              trackId={trackId}
              terrainProfileId={selectedTerrainProfile}
              color={colorByIndex(idx)}
              straightLine={straightLine}
            />
          ))}
        </>
      )}
    </Highchart>
  )
}

TerrainClearanceChart.propTypes = {
  zoomLevel: PropTypes.shape({
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired
  }),
  selectedTracks: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedTerrainProfile: PropTypes.number,
  straightLine: PropTypes.bool.isRequired
}

export default TerrainClearanceChart
