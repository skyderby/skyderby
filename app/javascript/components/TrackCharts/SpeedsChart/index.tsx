import React, { forwardRef } from 'react'
import { Chart } from 'highcharts'

import Highchart from 'components/Highchart'
import useChartOptions from './useChartOptions'
import { PointRecord } from 'api/hooks/tracks/points'
import { useTrackViewPreferences } from 'components/TrackViewPreferences'

type SpeedsChartProps = {
  points: PointRecord[]
  zeroWindPoints: PointRecord[]
  children?: (chart: Chart) => JSX.Element | null
}

const SpeedsChart = forwardRef(
  ({ points = [], zeroWindPoints = [], children }: SpeedsChartProps, ref) => {
    const {
      viewPreferences: { unitSystem }
    } = useTrackViewPreferences()
    const options = useChartOptions(points, zeroWindPoints, unitSystem)

    return (
      <Highchart autoResize ref={ref} options={options}>
        {children}
      </Highchart>
    )
  }
)

SpeedsChart.displayName = 'SpeedsChart'

export default SpeedsChart
