import React, { useRef } from 'react'
import { Chart } from 'highcharts'

import { PointRecord } from 'api/tracks/points'
import GlideRatioChart from './GlideRatioChart'
import SpeedsChart from './SpeedsChart'
import styles from './styles.module.scss'

type SplittedCharts = {
  points: PointRecord[]
  zeroWindPoints: PointRecord[]
  children?: (chart: Chart) => JSX.Element | null
}

interface ChartImperativeHandler {
  refreshTooltip: (e: React.MouseEvent | React.TouchEvent) => void
}

const SplittedCharts = ({
  points,
  zeroWindPoints,
  children
}: SplittedCharts): JSX.Element => {
  const glideRatioChartRef = useRef<ChartImperativeHandler>()
  const speedsChartRef = useRef<ChartImperativeHandler>()

  const handleShowTooltip = (evt: React.MouseEvent | React.TouchEvent) => {
    glideRatioChartRef.current?.refreshTooltip(evt)
    speedsChartRef.current?.refreshTooltip(evt)
  }

  return (
    <div
      className={styles.separateChartsContainer}
      onMouseMove={handleShowTooltip}
      onTouchMove={handleShowTooltip}
      onTouchStart={handleShowTooltip}
    >
      <div>
        <GlideRatioChart
          points={points}
          zeroWindPoints={zeroWindPoints}
          ref={glideRatioChartRef}
        >
          {children}
        </GlideRatioChart>
      </div>
      <div>
        <SpeedsChart points={points} zeroWindPoints={zeroWindPoints} ref={speedsChartRef}>
          {children}
        </SpeedsChart>
      </div>
    </div>
  )
}

export default SplittedCharts
