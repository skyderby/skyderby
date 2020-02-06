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
  MinMaxValue,
  Min,
  Max
} from './elements'

const valuePresentation = value => {
  const placeholder = '-.--'
  if (!Number.isFinite(value)) return placeholder

  const roundedValue = Math.round(value * 100) / 100
  if (roundedValue >= 10) {
    return '≥10'
  } else {
    return roundedValue.toFixed(2)
  }
}

const GlideRatio = ({ value }) => {
  return (
    <SummaryItem value="glide-ratio">
      <Title>{I18n.t('tracks.indicators.glide_ratio')}</Title>
      <ValueContainer>
        <Value data-testid="value[avg]">{valuePresentation(value.avg)}</Value>
        <MinMaxValue>
          <Max>
            <span data-testid="value[max]">{valuePresentation(value.max)}</span>
            <ChevronUp />
          </Max>
          <Min>
            <span data-testid="value[min]">{valuePresentation(value.min)}</span>
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
