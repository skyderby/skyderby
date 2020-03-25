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
import PlaceholderChart from './PlaceholderChart'
import TerrainClearance from './TerrainClearance'

const TerrainClearanceChart = ({ zoomLevel }) => {
  const options = useChartOptions(zoomLevel)
  const selectedTracks = useSelector(selectedTracksSelector)
  const selectedTerrainProfile = useSelector(selectedTerrainProfileSelector)

  const isSupporter = true

  if (!isSupporter) {
    return <PlaceholderChart text={'This chart available as a Supporter reward'} />
  }

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
  })
}

export default TerrainClearanceChart
