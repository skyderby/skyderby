import React from 'react'
import PropTypes from 'prop-types'

import Distance from './Distance'
import HorizontalSpeed from './HorizontalSpeed'
import GlideRatio from './GlideRatio'
import Elevation from './Elevation'
import VerticalSpeed from './VerticalSpeed'
import Time from './Time'
import { Container } from './elements'
import { RangeSummary } from './RangeSummary'

const Summary = ({ selectedPoints, zeroWindPoints, straightLine }) => {
  const summary = new RangeSummary(selectedPoints, { straightLine })
  const zeroWindSummary = new RangeSummary(zeroWindPoints, { straightLine })

  return (
    <Container>
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
    </Container>
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
