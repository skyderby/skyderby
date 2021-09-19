import React from 'react'

import { PointRecord } from 'api/hooks/tracks/points'
import Distance from './Distance'
import HorizontalSpeed from './HorizontalSpeed'
import GlideRatio from './GlideRatio'
import Elevation from './Elevation'
import VerticalSpeed from './VerticalSpeed'
import Time from './Time'
import { RangeSummary } from './RangeSummary'
import styles from './styles.module.scss'

type SummaryProps = {
  selectedPoints: PointRecord[]
  zeroWindPoints: PointRecord[]
  straightLine: boolean
}

const Summary = ({
  selectedPoints,
  zeroWindPoints,
  straightLine
}: SummaryProps): JSX.Element => {
  const summary = new RangeSummary(selectedPoints, { straightLine })
  const zeroWindSummary = new RangeSummary(zeroWindPoints, { straightLine })

  return (
    <div className={styles.container}>
      <Distance value={summary.distance} zeroWindValue={zeroWindSummary.distance} />
      <HorizontalSpeed
        value={summary.horizontalSpeed}
        zeroWindValue={zeroWindSummary.horizontalSpeed.avg}
      />
      <GlideRatio
        value={summary.glideRatio}
        zeroWindValue={zeroWindSummary.glideRatio.avg}
      />
      <Elevation value={summary.elevation} />
      <VerticalSpeed value={summary.verticalSpeed} />
      <Time value={summary.time} />
    </div>
  )
}

export default Summary
