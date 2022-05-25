import React from 'react'
import type { Chart } from 'highcharts'

import SplittedCharts from './SplittedCharts'
import CombinedChart from './CombinedChart'
import { PointRecord } from 'api/tracks/points'
import { useTrackViewPreferences, SINGLE_CHART } from 'components/TrackViewPreferences'

type ChartsProps = {
  points: PointRecord[]
  zeroWindPoints: PointRecord[]
  children?: (chart: Chart) => JSX.Element | null
}

const Charts = ({ points, zeroWindPoints, children }: ChartsProps): JSX.Element => {
  const { viewPreferences } = useTrackViewPreferences()
  const ChartComponent =
    viewPreferences.chartMode === SINGLE_CHART ? CombinedChart : SplittedCharts

  return (
    <ChartComponent points={points} zeroWindPoints={zeroWindPoints}>
      {children}
    </ChartComponent>
  )
}

export default Charts
