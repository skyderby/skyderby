import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'

const valuePresentation = (value: number | null): string | number => {
  if (value === null) return '--.-'

  return value.toFixed(1)
}

type TimeProps = {
  value: number | null
}

const Time = ({ value }: TimeProps): JSX.Element => {
  const { t } = useI18n()

  return (
    <div className={styles.summaryItem} data-value="time">
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

export default Time
