import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { useI18n } from 'components/TranslationsProvider'
import { selectUserPreferences, METRIC, IMPERIAL } from 'redux/userPreferences'
import { metersToMiles } from 'utils/unitsConversion'

import WindEffect from './WindEffect'

import styles from './styles.module.scss'

const valuePresentation = (value, unitSystem) => {
  const placeholder = unitSystem === METRIC ? '----' : '-.---'
  if (!Number.isFinite(value)) return placeholder

  if (unitSystem === METRIC) return Math.round(value)
  if (unitSystem === IMPERIAL) return Math.round(metersToMiles(value) * 1000) / 1000

  return placeholder
}

const Distance = ({ value, zeroWindValue }) => {
  const { t } = useI18n()
  const { unitSystem } = useSelector(selectUserPreferences)
  const units = unitSystem === METRIC ? 'm' : 'mi'

  return (
    <div className={styles.summaryItem} value="distance">
      <div className={styles.title}>{t('tracks.indicators.distance')}</div>
      <div className={styles.valueContainer}>
        <div className={styles.value} aria-label="distance">
          {valuePresentation(value, unitSystem)}
        </div>
        <div className={styles.units}>{t(`units.${units}`)}</div>
      </div>

      {Number.isFinite(zeroWindValue) && (
        <WindEffect
          rawValue={value}
          zeroWindValue={zeroWindValue}
          valuePresenter={val => valuePresentation(val, unitSystem)}
        />
      )}
    </div>
  )
}

Distance.propTypes = {
  value: PropTypes.number,
  zeroWindValue: PropTypes.number
}

export default Distance
