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

const Summary = ({ selectedPoints }) => {
  const summary = new RangeSummary(selectedPoints)

  const track = {}
  return (
    <Container>
      <Distance track={track} />
      <HorizontalSpeed track={track} />
      <GlideRatio track={track} />
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
      elevation: PropTypes.number.isRequired,
      vSpeed: PropTypes.number.isRequired,
      hSpeed: PropTypes.number.isRequired
    })
  ).isRequired
}
export default Summary
