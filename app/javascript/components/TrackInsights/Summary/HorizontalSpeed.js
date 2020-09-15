import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { useI18n } from 'components/TranslationsProvider'
import { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
import { msToKmh, msToMph } from 'utils/unitsConversion'

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

const valuePresentation = (value, unitSystem) => {
  const placeholder = '---'
  if (!Number.isFinite(value)) return placeholder

  if (unitSystem === METRIC) return Math.round(msToKmh(value))
  if (unitSystem === IMPERIAL) return Math.round(msToMph(value))

  return placeholder
}

const HorizontalSpeed = ({ value, zeroWindValue }) => {
  const { t } = useI18n()
  const { unitSystem } = useSelector(state => state.userPreferences)
  const units = unitSystem === METRIC ? 'kmh' : 'mph'

  return (
    <SummaryItem value="ground-speed">
      <Title>{t('tracks.indicators.ground_speed')}</Title>
      <ValueContainer>
        <Value aria-label="average horizontal speed">
          {valuePresentation(value.avg, unitSystem)}
        </Value>
        <MinMaxValue>
          <Max>
            <span aria-label="maximum horizontal speed">
              {valuePresentation(value.max, unitSystem)}
            </span>
            <ChevronUp />
          </Max>
          <Min>
            <span aria-label="minimum horizontal speed">
              {valuePresentation(value.min, unitSystem)}
            </span>
            <ChevronDown />
          </Min>
        </MinMaxValue>
        <Units>{t(`units.${units}`)}</Units>
      </ValueContainer>

      {Number.isFinite(zeroWindValue) && (
        <WindEffect
          rawValue={value.avg}
          zeroWindValue={zeroWindValue}
          valuePresenter={val => valuePresentation(val, unitSystem)}
        />
      )}
    </SummaryItem>
  )
}

HorizontalSpeed.propTypes = {
  value: PropTypes.shape({
    avg: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number
  }).isRequired,
  zeroWindValue: PropTypes.number
}

export default HorizontalSpeed
