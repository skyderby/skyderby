import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { selectUserPreferences, METRIC, IMPERIAL } from 'redux/userPreferences'
import { metersToFeet } from 'utils/unitsConversion'

import styles from './styles.module.scss'

const valuePresentation = (value, unitSystem) => {
  const placeholder = '----'
  if (!Number.isFinite(value)) return placeholder

  if (unitSystem === METRIC) return Math.round(value)
  if (unitSystem === IMPERIAL) return Math.round(metersToFeet(value))

  return placeholder
}

const Elevation = ({ value }) => {
  const { t } = useI18n()
  const { unitSystem } = useSelector(selectUserPreferences)
  const units = unitSystem === METRIC ? 'm' : 'ft'

  return (
    <div className={styles.summaryItem} value="elevation">
      <div className={styles.title}>{t('tracks.indicators.elevation')}</div>
      <div className={styles.valueContainer}>
        <div className={styles.value} aria-label="elevation">
          {valuePresentation(value, unitSystem)}
        </div>
        <div className={styles.units}>{t(`units.${units}`)}</div>
      </div>
    </div>
  )
}

Elevation.propTypes = {
  value: PropTypes.number
}

export default Elevation
