import React, { forwardRef } from 'react'
import Highchart from 'components/Highchart'

import useChartOptions from './useChartOptions'
import { PointRecord } from 'api/tracks/points'
import { Chart } from 'highcharts'

type GlideRatioChartProps = {
  points: PointRecord[]
  zeroWindPoints: PointRecord[]
  children?: (chart: Chart) => JSX.Element | null
}

const GlideRatioChart = forwardRef(
  ({ points = [], zeroWindPoints = [], children }: GlideRatioChartProps, ref) => {
    const options = useChartOptions(points, zeroWindPoints)

    return (
      <Highchart autoResize ref={ref} options={options}>
        {children}
      </Highchart>
    )
  }
)

GlideRatioChart.displayName = 'GlideRatioChart'

export default GlideRatioChart
