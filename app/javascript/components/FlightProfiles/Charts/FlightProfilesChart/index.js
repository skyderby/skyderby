import React from 'react'
import { useSelector } from 'react-redux'
import I18n from 'i18n-js'

import Highchart from 'components/Highchart'
import useChartOptions from './useChartOptions'
import FlightProfile from './FlightProfile'
import { selectSelectedTracks } from 'redux/flightProfiles'

const FlightProfilesChart = () => {
  const options = useChartOptions()
  const selectedTracks = useSelector(selectSelectedTracks)

  return (
    <Highchart autoResize options={options}>
      {chart => (
        <>
          {selectedTracks.map(trackId => (
            <FlightProfile key={trackId} chart={chart} trackId={trackId} />
          ))}
        </>
      )}
    </Highchart>
  )
}

export default FlightProfilesChart
