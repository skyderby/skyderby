import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { useI18n } from 'components/TranslationsProvider'
import { selectUserPreferences, METRIC, IMPERIAL } from 'redux/userPreferences'
import { msToKmh, msToMph } from 'utils/unitsConversion'

import ChevronDown from 'icons/chevron-down.svg'
import ChevronUp from 'icons/chevron-up.svg'
import WindEffect from './WindEffect'

import styles from './styles.module.scss'

const valuePresentation = (value, unitSystem) => {
  const placeholder = '---'
  if (!Number.isFinite(value)) return placeholder

  if (unitSystem === METRIC) return Math.round(msToKmh(value))
  if (unitSystem === IMPERIAL) return Math.round(msToMph(value))

  return placeholder
}

const HorizontalSpeed = ({ value, zeroWindValue }) => {
  const { t } = useI18n()
  const { unitSystem } = useSelector(selectUserPreferences)
  const units = unitSystem === METRIC ? 'kmh' : 'mph'

  return (
    <div className={styles.summaryItem} value="ground-speed">
      <div className={styles.title}>{t('tracks.indicators.ground_speed')}</div>
      <div className={styles.valueContainer}>
        <div className={styles.value} aria-label="average horizontal speed">
          {valuePresentation(value.avg, unitSystem)}
        </div>
        <div className={styles.minMaxValue}>
          <div className={styles.max}>
            <span aria-label="maximum horizontal speed">
              {valuePresentation(value.max, unitSystem)}
            </span>
            <ChevronUp />
          </div>
          <div className={styles.min}>
            <span aria-label="minimum horizontal speed">
              {valuePresentation(value.min, unitSystem)}
            </span>
            <ChevronDown />
          </div>
        </div>
        <div className={styles.units}>{t(`units.${units}`)}</div>
      </div>

      {Number.isFinite(zeroWindValue) && (
        <WindEffect
          rawValue={value.avg}
          zeroWindValue={zeroWindValue}
          valuePresenter={val => valuePresentation(val, unitSystem)}
        />
      )}
    </div>
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
