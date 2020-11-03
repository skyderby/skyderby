import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
import { msToKmh, msToMph } from 'utils/unitsConversion'

import ChevronDown from 'icons/chevron-down.svg'
import ChevronUp from 'icons/chevron-up.svg'

import styles from './styles.module.scss'

const valuePresentation = (value, unitSystem) => {
  const placeholder = '---'
  if (!Number.isFinite(value)) return placeholder

  if (unitSystem === METRIC) return Math.round(msToKmh(value))
  if (unitSystem === IMPERIAL) return Math.round(msToMph(value))

  return placeholder
}

const VerticalSpeed = ({ value }) => {
  const { t } = useI18n()
  const { unitSystem } = useSelector(state => state.userPreferences)
  const units = unitSystem === METRIC ? 'kmh' : 'mph'

  return (
    <div className={styles.summaryItem} value="vertical-speed">
      <div className={styles.title}>{t('tracks.indicators.vertical_speed')}</div>
      <div className={styles.valueContainer}>
        <div className={styles.value} aria-label="average vertical speed">
          {valuePresentation(value.avg, unitSystem)}
        </div>

        <div className={styles.minMaxValue}>
          <div className={styles.min}>
            <span aria-label="maximum vertical speed">
              {valuePresentation(value.max, unitSystem)}
            </span>
            <ChevronUp />
          </div>
          <div className={styles.max}>
            <span aria-label="minimum vertical speed">
              {valuePresentation(value.min, unitSystem)}
            </span>
            <ChevronDown />
          </div>
        </div>

        <div className={styles.units}>{t(`units.${units}`)}</div>
      </div>
    </div>
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
