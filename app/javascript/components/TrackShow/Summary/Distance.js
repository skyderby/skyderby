import React from 'react'

import WindEffect from './WindEffect'
import { SummaryItem, Title, ValueContainer, Value, Units } from './elements'

const Distance = ({ track }) => {
  return (
    <SummaryItem value="distance">
      <Title>{I18n.t('tracks.indicators.distance')}</Title>
      <ValueContainer>
        <Value>830</Value>
        <Units>{I18n.t('units.m')}</Units>
      </ValueContainer>

      <WindEffect rawValue={600} zeroWindValue={830} />
    </SummaryItem>
  )
}

export default Distance
