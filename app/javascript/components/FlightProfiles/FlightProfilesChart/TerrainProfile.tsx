import React, { memo } from 'react'
import { Chart, Point } from 'highcharts'
import PropTypes from 'prop-types'

import { I18n } from 'components/TranslationsProvider'
import Highchart from 'components/Highchart'
import { useTerrainProfileQuery } from 'api/terrainProfiles'
import { usePlaceQuery } from 'api/places'
import {
  MeasurementRecord,
  useTerrainProfileMeasurementQuery
} from 'api/terrainProfileMeasurements'

const tooltip = {
  headerFormat: `
    <span style="font-size: 14px">{series.name}</span><br/>
  `,
  pointFormatter: function (this: Point) {
    return `
    <span style="font-size: 16px">↓${this.y} ${I18n.t('units.m')}
      →${this.x} ${I18n.t('units.m')}
    </span><br/>`
  }
}

const calcMeasurementPoints = (measurements: MeasurementRecord[]) => {
  const lastRecord = measurements[measurements.length - 1]
  if (!lastRecord) return []

  return measurements.map(el => [el.distance, el.altitude, lastRecord.altitude])
}

type TerrainProfileProps = {
  chart: Chart
  terrainProfileId: number
  color: string
}

const TerrainProfile = ({
  chart,
  terrainProfileId,
  color
}: TerrainProfileProps): JSX.Element | null => {
  const { data: terrainProfile } = useTerrainProfileQuery(terrainProfileId)
  const { data: measurements = [] } = useTerrainProfileMeasurementQuery(terrainProfileId)
  const { data: place } = usePlaceQuery(terrainProfile?.placeId)

  if (!terrainProfile || !measurements) return null

  const measurementPoints = calcMeasurementPoints(measurements)

  const name = `${place?.name} - ${terrainProfile?.name}`

  return (
    <>
      <Highchart.Series
        chart={chart}
        type="spline"
        data={measurementPoints}
        tooltip={tooltip}
        color={color}
        name={name}
        custom={{
          place: place?.name
        }}
      />
      <Highchart.Series
        chart={chart}
        type="areasplinerange"
        data={measurementPoints}
        color={color}
        enableMouseTracking={false}
        showInLegend={false}
      />
    </>
  )
}

TerrainProfile.propTypes = {
  chart: PropTypes.object,
  color: PropTypes.string.isRequired,
  terrainProfileId: PropTypes.number.isRequired
}

export default memo(TerrainProfile)
