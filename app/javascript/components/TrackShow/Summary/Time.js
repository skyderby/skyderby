import React from 'react'
import PropTypes from 'prop-types'
import I18n from 'i18n-js'

import { SummaryItem, Title, ValueContainer, Value, Units } from './elements'

const valuePresentation = value => {
  if (!Number.isFinite(value)) return '--.-'

  return value.toFixed(1)
}

const Time = ({ value }) => {
  return (
    <SummaryItem value="time">
      <Title>{I18n.t('tracks.indicators.duration')}</Title>
      <ValueContainer>
        <Value data-testid="value">{valuePresentation(value)}</Value>
        <Units>{I18n.t('units.sec')}</Units>
      </ValueContainer>
    </SummaryItem>
  )
}

Time.propTypes = {
  value: PropTypes.number
}

export default Time
