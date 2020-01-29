import React from 'react'
import PropTypes from 'prop-types'

import { SummaryItem, Title, ValueContainer, Value, Units } from './elements'

const valuePresentation = value => {
  if (!Number.isFinite(value)) return '----'

  return Math.round(value)
}

const Elevation = ({ value }) => {
  return (
    <SummaryItem value="elevation">
      <Title>{I18n.t('tracks.indicators.elevation')}</Title>
      <ValueContainer>
        <Value>{valuePresentation(value)}</Value>
        <Units>{I18n.t('units.m')}</Units>
      </ValueContainer>
    </SummaryItem>
  )
}

Elevation.propTypes = {
  value: PropTypes.number
}

export default Elevation
