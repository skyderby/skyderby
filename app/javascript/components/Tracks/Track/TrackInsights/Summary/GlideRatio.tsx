import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import ChevronDown from 'icons/chevron-down.svg'
import ChevronUp from 'icons/chevron-up.svg'
import WindEffect from './WindEffect'
import styles from './styles.module.scss'

const valuePresentation = (value: number | null): string => {
  const placeholder = '-.--'
  if (!value || Number.isNaN(value)) return placeholder

  const roundedValue = Math.round(value * 100) / 100
  if (roundedValue >= 10) {
    return '≥10'
  } else {
    return roundedValue.toFixed(2)
  }
}

type GlideRatioProps = {
  value: {
    min: number | null
    max: number | null
    avg: number | null
  }
  zeroWindValue: number | null
}

const GlideRatio = ({ value, zeroWindValue }: GlideRatioProps): JSX.Element => {
  const { t } = useI18n()
  const { min, max, avg } = value
  const showWindEffect = avg && zeroWindValue

  return (
    <div className={styles.summaryItem} data-value="glide-ratio">
      <div className={styles.title}>{t('tracks.indicators.glide_ratio')}</div>
      <div className={styles.valueContainer}>
        <div className={styles.value} aria-label="average glide ratio">
          {valuePresentation(avg)}
        </div>
        <div className={styles.minMaxValue}>
          <div className={styles.max}>
            <span aria-label="maximum glide ratio">{valuePresentation(max)}</span>
            <ChevronUp />
          </div>
          <div className={styles.min}>
            <span aria-label="minimum glide ratio">{valuePresentation(min)}</span>
            <ChevronDown />
          </div>
        </div>
      </div>

      {showWindEffect && (
        <WindEffect
          rawValue={avg}
          zeroWindValue={zeroWindValue}
          valuePresenter={valuePresentation}
        />
      )}
    </div>
  )
}

export default GlideRatio
