import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'
import { createTerrainProfileSelector } from 'redux/terrainProfiles'
import { createMeasurementsSelector } from 'redux/terrainProfileMeasurements'

const tooltip = {
  headerFormat: `
    <span style="font-size: 14px">{series.name}</span><br/>
    <span style="font-size: 12px">{series.options.place}</span><br/>
  `,
  pointFormat: '<span style="font-size: 16px">↓{point.y} →{point.x}</span><br/>'
}

const calcMeasurementPoints = measurements => {
  const records = measurements?.records || []

  return records.map(el => [
    el.distance,
    el.altitude,
    records[records.length - 1].altitude
  ])
}

const TerrainProfile = ({ chart, terrainProfileId }) => {
  const terrainProfile = useSelector(createTerrainProfileSelector(terrainProfileId))
  const measurements = useSelector(createMeasurementsSelector(terrainProfileId))

  if (!terrainProfile || !measurements) return null

  const measurementPoints = calcMeasurementPoints(measurements)

  const name = `${terrainProfile.place.name} - ${terrainProfile.name}`

  return (
    <>
      <Highchart.Series
        chart={chart}
        data={measurementPoints}
        tooltip={tooltip}
        color="#B88E8D"
        name={name}
        place={terrainProfile.place.name}
      />
      <Highchart.Series
        chart={chart}
        type="areasplinerange"
        data={measurementPoints}
        color="#B88E8D"
        enableMouseTracking={false}
        showInLegend={false}
      />
    </>
  )
}

TerrainProfile.propTypes = {
  chart: PropTypes.object,
  terrainProfileId: PropTypes.number.isRequired
}

export default TerrainProfile
