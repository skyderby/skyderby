import React from 'react'

import styles from './styles.module.scss'
import { useI18n } from 'components/TranslationsProvider'

interface Result {
  result: number
  exitAltitude: number
}

type IndicatorsProps = {
  result: Result
  resultWindow?: number[]
}

const Indicators = ({ result, resultWindow }: IndicatorsProps): JSX.Element => {
  const { t } = useI18n()

  return (
    <div className={styles.indicators}>
      <div className={styles.indicatorTitle}>Result</div>
      <div className={styles.indicatorValue}>
        {Number.isFinite(result.result) ? (
          <>
            {result.result.toFixed(2)} {t('units.kmh')}
          </>
        ) : (
          <>&mdash;</>
        )}
      </div>
      <div className={styles.indicatorTitle}>Exit Altitude</div>
      <div className={styles.indicatorValue}>
        {Number.isFinite(result.exitAltitude) ? (
          <>
            {result.exitAltitude} {t('units.m')}
          </>
        ) : (
          <>&mdash;</>
        )}
      </div>
      <div className={styles.indicatorTitle}>Window</div>
      <div className={styles.indicatorValue}>
        {(resultWindow?.length || 0) > 0 ? (
          <>
            {resultWindow?.join(' - ')} {t('units.m')}
          </>
        ) : (
          <>&mdash;</>
        )}
      </div>
    </div>
  )
}

export default Indicators
