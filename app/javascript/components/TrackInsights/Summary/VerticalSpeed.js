import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import I18n from 'i18n-js'

import { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
import { msToKmh, msToMph } from 'utils/unitsConversion'

import ChevronDown from 'icons/chevron-down.svg'
import ChevronUp from 'icons/chevron-up.svg'
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

const valuePresentation = (value, unitSystem) => {
  const placeholder = '---'
  if (!Number.isFinite(value)) return placeholder

  if (unitSystem === METRIC) return Math.round(msToKmh(value))
  if (unitSystem === IMPERIAL) return Math.round(msToMph(value))

  return placeholder
}

const VerticalSpeed = ({ value }) => {
  const { unitSystem } = useSelector(state => state.userPreferences)
  const units = unitSystem === METRIC ? 'kmh' : 'mph'

  return (
    <SummaryItem value="vertical-speed">
      <Title>{I18n.t('tracks.indicators.vertical_speed')}</Title>
      <ValueContainer>
        <Value aria-label="average vertical speed">
          {valuePresentation(value.avg, unitSystem)}
        </Value>
        <MinMaxValue>
          <Max>
            <span aria-label="maximum vertical speed">
              {valuePresentation(value.max, unitSystem)}
            </span>
            <ChevronUp />
          </Max>
          <Min>
            <span aria-label="minimum vertical speed">
              {valuePresentation(value.min, unitSystem)}
            </span>
            <ChevronDown />
          </Min>
        </MinMaxValue>
        <Units>{I18n.t(`units.${units}`)}</Units>
      </ValueContainer>
    </SummaryItem>
  )
}

VerticalSpeed.propTypes = {
  value: PropTypes.shape({
    avg: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number
  }).isRequired
}

export default VerticalSpeed
