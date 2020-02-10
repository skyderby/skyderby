import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import GlideRatioChart from './GlideRatioChart'
import SpeedsChart from './SpeedsChart'

const Charts = ({ points, zeroWindPoints }) => {
  const glideRatioChartRef = useRef()
  const speedsChartRef = useRef()

  const handleShowTooltip = evt => {
    glideRatioChartRef.current.refreshTooltip(evt)
    speedsChartRef.current.refreshTooltip(evt)
  }

  return (
    <div
      onMouseMove={handleShowTooltip}
      onTouchMove={handleShowTooltip}
      onTouchStart={handleShowTooltip}
    >
      <GlideRatioChart
        points={points}
        zeroWindPoints={zeroWindPoints}
        ref={glideRatioChartRef}
      />
      <SpeedsChart points={points} zeroWindPoints={zeroWindPoints} ref={speedsChartRef} />
    </div>
  )
}

Charts.propTypes = {
  points: PropTypes.array.isRequired,
  zeroWindPoints: PropTypes.array
}

export default Charts
