import React from 'react'
import PropTypes from 'prop-types'

import Distance from './Distance'
import HorizontalSpeed from './HorizontalSpeed'
import GlideRatio from './GlideRatio'
import Elevation from './Elevation'
import VerticalSpeed from './VerticalSpeed'
import Time from './Time'
import { RangeSummary } from './RangeSummary'

import styles from './styles.module.scss'

const Summary = ({ selectedPoints, zeroWindPoints, straightLine }) => {
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

Summary.propTypes = {
  selectedPoints: PropTypes.arrayOf(
    PropTypes.shape({
      gpsTime: PropTypes.number.isRequired,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      altitude: PropTypes.number.isRequired,
      vSpeed: PropTypes.number.isRequired,
      hSpeed: PropTypes.number.isRequired,
      glideRatio: PropTypes.number.isRequired
    })
  ).isRequired,
  straightLine: PropTypes.bool.isRequired,
  zeroWindPoints: PropTypes.arrayOf(
    PropTypes.shape({
      gpsTime: PropTypes.number.isRequired,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      altitude: PropTypes.number.isRequired,
      vSpeed: PropTypes.number.isRequired,
      hSpeed: PropTypes.number.isRequired,
      glideRatio: PropTypes.number.isRequired
    })
  )
}

export default Summary
