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

const Summary = ({ selectedPoints, straightLine }) => {
  const summary = new RangeSummary(selectedPoints, { straightLine })

  return (
    <Container>
      <Distance value={summary.distance} />
      <HorizontalSpeed value={summary.horizontalSpeed} />
      <GlideRatio value={summary.glideRatio} />
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
      altitude: PropTypes.number.isRequired,
      vSpeed: PropTypes.number.isRequired,
      hSpeed: PropTypes.number.isRequired,
      glideRatio: PropTypes.number.isRequired
    })
  ).isRequired,
  straightLine: PropTypes.bool.isRequired
}
export default Summary
