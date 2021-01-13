import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import I18n from 'i18n-js'

import { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
import { metersToMiles } from 'utils/unitsConversion'

import WindEffect from './WindEffect'
import { SummaryItem, Title, ValueContainer, Value, Units } from './elements'

const valuePresentation = (value, unitSystem) => {
  const placeholder = unitSystem === METRIC ? '----' : '-.---'
  if (!Number.isFinite(value)) return placeholder

  if (unitSystem === METRIC) return Math.round(value)
  if (unitSystem === IMPERIAL) return Math.round(metersToMiles(value) * 1000) / 1000

  return placeholder
}

const Distance = ({ value, zeroWindValue }) => {
  const { unitSystem } = useSelector(state => state.userPreferences)
  const units = unitSystem === METRIC ? 'm' : 'mi'

  return (
    <SummaryItem value="distance">
      <Title>{I18n.t('tracks.indicators.distance')}</Title>
      <ValueContainer>
        <Value aria-label="distance">{valuePresentation(value, unitSystem)}</Value>
        <Units>{I18n.t(`units.${units}`)}</Units>
      </ValueContainer>

      {Number.isFinite(zeroWindValue) && (
        <WindEffect
          rawValue={value}
          zeroWindValue={zeroWindValue}
          valuePresenter={val => valuePresentation(val, unitSystem)}
        />
      )}
    </SummaryItem>
  )
}

Distance.propTypes = {
  value: PropTypes.number,
  zeroWindValue: PropTypes.number
}

export default Distance
