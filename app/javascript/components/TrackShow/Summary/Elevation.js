import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import I18n from 'i18n-js'

import { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
import { metersToFeet } from 'utils/unitsConversion'
import { SummaryItem, Title, ValueContainer, Value, Units } from './elements'

const valuePresentation = (value, unitSystem) => {
  const placeholder = '----'
  if (!Number.isFinite(value)) return placeholder

  if (unitSystem === METRIC) return Math.round(value)
  if (unitSystem === IMPERIAL) return Math.round(metersToFeet(value))

  return placeholder
}

const Elevation = ({ value }) => {
  const { unitSystem } = useSelector(state => state.userPreferences)
  const units = unitSystem === METRIC ? 'm' : 'ft'

  return (
    <SummaryItem value="elevation">
      <Title>{I18n.t('tracks.indicators.elevation')}</Title>
      <ValueContainer>
        <Value data-testid="value">{valuePresentation(value, unitSystem)}</Value>
        <Units>{I18n.t(`units.${units}`)}</Units>
      </ValueContainer>
    </SummaryItem>
  )
}

Elevation.propTypes = {
  value: PropTypes.number
}

export default Elevation
