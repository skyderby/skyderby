import React from 'react'

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

const HorizontalSpeed = ({ track }) => {
  return (
    <SummaryItem value="ground-speed">
      <Title>{I18n.t('tracks.indicators.ground_speed')}</Title>
      <ValueContainer>
        <Value>111</Value>
        <MinMaxValue>
          <Max>
            <span>139</span>
            <ChevronUp />
          </Max>
          <Min>
            <span>12</span>
            <ChevronDown />
          </Min>
        </MinMaxValue>
        <Units>{I18n.t('units.kmh')}</Units>
      </ValueContainer>

      <WindEffect rawValue={111} zeroWindValue={139} />
    </SummaryItem>
  )
}

export default HorizontalSpeed
