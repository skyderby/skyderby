import React from 'react'

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

export default Summary
