import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import ChevronDown from 'icons/chevron-down.svg'
import ChevronUp from 'icons/chevron-up.svg'
import WindEffect from './WindEffect'

import styles from './styles.module.scss'

const valuePresentation = value => {
  const placeholder = '-.--'
  if (!Number.isFinite(value)) return placeholder

  const roundedValue = Math.round(value * 100) / 100
  if (roundedValue >= 10) {
    return '≥10'
  } else {
    return roundedValue.toFixed(2)
  }
}

const GlideRatio = ({ value, zeroWindValue }) => {
  const { t } = useI18n()

  return (
    <div className={styles.summaryItem} value="glide-ratio">
      <div className={styles.title}>{t('tracks.indicators.glide_ratio')}</div>
      <div className={styles.valueContainer}>
        <div className={styles.value} aria-label="average glide ratio">
          {valuePresentation(value.avg)}
        </div>
        <div className={styles.minMaxValue}>
          <div className={styles.max}>
            <span aria-label="maximum glide ratio">{valuePresentation(value.max)}</span>
            <ChevronUp />
          </div>
          <div className={styles.min}>
            <span aria-label="minimum glide ratio">{valuePresentation(value.min)}</span>
            <ChevronDown />
          </div>
        </div>
      </div>

      {Number.isFinite(zeroWindValue) && (
        <WindEffect
          rawValue={value.avg}
          zeroWindValue={zeroWindValue}
          valuePresenter={valuePresentation}
        />
      )}
    </div>
  )
}

GlideRatio.propTypes = {
  value: PropTypes.shape({
    avg: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number
  }).isRequired,
  zeroWindValue: PropTypes.number
}

export default GlideRatio
