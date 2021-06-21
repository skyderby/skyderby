import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'

import styles from './styles.module.scss'

const valuePresentation = value => {
  if (!Number.isFinite(value)) return '--.-'

  return value.toFixed(1)
}

const Time = ({ value }) => {
  const { t } = useI18n()

  return (
    <div className={styles.summaryItem} value="time">
      <div className={styles.title}>{t('tracks.indicators.duration')}</div>
      <div className={styles.valueContainer}>
        <div className={styles.value} aria-label="duration">
          {valuePresentation(value)}
        </div>
        <div className={styles.units}>{t('units.sec')}</div>
      </div>
    </div>
  )
}

Time.propTypes = {
  value: PropTypes.number
}

export default Time
