import React from 'react'
import { Chart, Options } from 'highcharts'

import { PointRecord } from 'api/tracks/points'
import Highchart from 'components/Highchart'
import useChartOptions from './useChartOptions'

type AltitudeChartProps = {
  points: PointRecord[]
  children: (chart: Chart) => JSX.Element | null
  options: Options
  loading?: boolean
}

const AltitudeChart = ({
  points,
  children,
  options: additionalOptions,
  ...props
}: AltitudeChartProps): JSX.Element => {
  const options = useChartOptions(points, additionalOptions)

  return (
    <Highchart options={options} {...props}>
      {children}
    </Highchart>
  )
}

export default AltitudeChart
