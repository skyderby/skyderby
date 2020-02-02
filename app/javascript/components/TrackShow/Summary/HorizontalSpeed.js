import React from 'react'
import PropTypes from 'prop-types'
import I18n from 'i18n-js'

import ChevronDown from 'icons/chevron-down.svg'
import ChevronUp from 'icons/chevron-up.svg'
import WindEffect from './WindEffect'
import {
  SummaryItem,
  Title,
  ValueContainer,
  Value,
  Units,
  MinMaxValue,
  Min,
  Max
} from './elements'

const HorizontalSpeed = ({ value = { avg: 111, min: 12, max: 139 } }) => {
  return (
    <SummaryItem value="ground-speed">
      <Title>{I18n.t('tracks.indicators.ground_speed')}</Title>
      <ValueContainer>
        <Value>{value.avg}</Value>
        <MinMaxValue>
          <Max>
            <span>{value.max}</span>
            <ChevronUp />
          </Max>
          <Min>
            <span>{value.min}</span>
            <ChevronDown />
          </Min>
        </MinMaxValue>
        <Units>{I18n.t('units.kmh')}</Units>
      </ValueContainer>

      <WindEffect rawValue={111} zeroWindValue={139} />
    </SummaryItem>
  )
}

HorizontalSpeed.propTypes = {
  value: PropTypes.shape({
    avg: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number
  }).isRequired
}

export default HorizontalSpeed
