import React from 'react'
import PropTypes from 'prop-types'

import WindEffect from './WindEffect'
import { SummaryItem, Title, ValueContainer, Value, Units } from './elements'

const Distance = ({ value = 830 }) => {
  return (
    <SummaryItem value="distance">
      <Title>{I18n.t('tracks.indicators.distance')}</Title>
      <ValueContainer>
        <Value>{value}</Value>
        <Units>{I18n.t('units.m')}</Units>
      </ValueContainer>

      <WindEffect rawValue={600} zeroWindValue={830} />
    </SummaryItem>
  )
}

Distance.propTypes = {
  value: PropTypes.number
}

export default Distance
