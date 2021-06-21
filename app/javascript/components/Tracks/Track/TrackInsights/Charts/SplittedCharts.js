import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import GlideRatioChart from './GlideRatioChart'
import SpeedsChart from './SpeedsChart'

import styles from './styles.module.scss'

const SplittedCharts = ({ points, zeroWindPoints }) => {
  const glideRatioChartRef = useRef()
  const speedsChartRef = useRef()

  const handleShowTooltip = evt => {
    glideRatioChartRef.current.refreshTooltip(evt)
    speedsChartRef.current.refreshTooltip(evt)
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
        />
      </div>
      <div>
        <SpeedsChart
          points={points}
          zeroWindPoints={zeroWindPoints}
          ref={speedsChartRef}
        />
      </div>
    </div>
  )
}

SplittedCharts.propTypes = {
  points: PropTypes.array.isRequired,
  zeroWindPoints: PropTypes.array
}

export default SplittedCharts
