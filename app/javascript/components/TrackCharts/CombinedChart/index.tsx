import React from 'react'
import { Chart, SeriesOptionsType } from 'highcharts'

import { PointRecord } from 'api/tracks/points'
import Highchart from 'components/Highchart'
import { useTrackViewPreferences } from 'components/TrackViewPreferences'
import useChartOptions from './useChartOptions'

type CombinedChartProps = {
  points: PointRecord[]
  zeroWindPoints: PointRecord[]
  additionalSeries?: SeriesOptionsType[]
  children?: (chart: Chart) => JSX.Element | null
}

const CombinedChart = ({
  points,
  zeroWindPoints = [],
  additionalSeries = [],
  children,
  ...props
}: CombinedChartProps): JSX.Element => {
  const { viewPreferences } = useTrackViewPreferences()
  const options = useChartOptions(
    points,
    zeroWindPoints,
    viewPreferences.unitSystem,
    additionalSeries
  )

  return (
    <Highchart autoResize options={options} {...props}>
      {children}
    </Highchart>
  )
}

export default CombinedChart
