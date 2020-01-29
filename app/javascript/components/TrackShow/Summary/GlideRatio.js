import React from 'react'

import ChevronDown from 'icons/chevron-down.svg'
import ChevronUp from 'icons/chevron-up.svg'
import WindEffect from './WindEffect'
import {
  SummaryItem,
  Title,
  ValueContainer,
  Value,
  MinMaxValue,
  Min,
  Max
} from './elements'

const GlideRatio = ({ track }) => {
  return (
    <SummaryItem value="glide-ratio">
      <Title>{I18n.t('tracks.indicators.glide_ratio')}</Title>
      <ValueContainer>
        <Value>0.83</Value>
        <MinMaxValue>
          <Max>
            <span>1.39</span>
            <ChevronUp />
          </Max>
          <Min>
            <span>0.07</span>
            <ChevronDown />
          </Min>
        </MinMaxValue>
      </ValueContainer>

      <WindEffect rawValue={0.6} zeroWindValue={0.23} />
    </SummaryItem>
  )
}

export default GlideRatio
