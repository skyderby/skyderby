import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
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
  const { t } = useI18n()
  const { unitSystem } = useSelector(state => state.userPreferences)
  const units = unitSystem === METRIC ? 'm' : 'ft'

  return (
    <SummaryItem value="elevation">
      <Title>{t('tracks.indicators.elevation')}</Title>
      <ValueContainer>
        <Value aria-label="elevation">{valuePresentation(value, unitSystem)}</Value>
        <Units>{t(`units.${units}`)}</Units>
      </ValueContainer>
    </SummaryItem>
  )
}

Elevation.propTypes = {
  value: PropTypes.number
}

export default Elevation
