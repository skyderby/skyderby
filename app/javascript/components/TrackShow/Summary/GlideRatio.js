import React from 'react'
import PropTypes from 'prop-types'

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

const GlideRatio = ({ value = { avg: 0.83, min: 0.07, max: 1.39 } }) => {
  return (
    <SummaryItem value="glide-ratio">
      <Title>{I18n.t('tracks.indicators.glide_ratio')}</Title>
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
      </ValueContainer>

      <WindEffect rawValue={0.6} zeroWindValue={0.23} />
    </SummaryItem>
  )
}

GlideRatio.propTypes = {
  value: PropTypes.shape({
    avg: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number
  }).isRequired
}

export default GlideRatio
