import React from 'react'

import styles from './styles.module.scss'
import { useI18n } from 'components/TranslationsProvider'

interface Result {
  result: number
  exitAltitude: number
}

type IndicatorsProps = {
  result: Result
  resultWindow?: [number, number]
}

const Indicators = ({ result, resultWindow }: IndicatorsProps): JSX.Element => {
  const { t } = useI18n()

  return (
    <div className={styles.indicators}>
      <div className={styles.indicatorTitle}>Result</div>
      <div className={styles.indicatorValue}>
        {result.result.toFixed(2)} {t('units.kmh')}
      </div>
      <div className={styles.indicatorTitle}>Exit Altitude</div>
      <div className={styles.indicatorValue}>
        {result.exitAltitude} {t('units.m')}
      </div>
      <div className={styles.indicatorTitle}>Window</div>
      <div className={styles.indicatorValue}>
        {resultWindow?.join(' - ') || '---'} {t('units.m')}
      </div>
    </div>
  )
}

export default Indicators
