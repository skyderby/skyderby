import React from 'react'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const windEffectPresentation = (value, presenter) => {
  if (value === 0) return 0
  if (value > 0) return `+${presenter(value)}`
  if (value < 0) return `-${presenter(Math.abs(value))}`
}

const WindEffect = ({ rawValue, zeroWindValue, valuePresenter = val => val }) => {
  const windEffect = rawValue - zeroWindValue
  const windEffectPercent =
    100 - (Math.min(rawValue, zeroWindValue) / Math.max(rawValue, zeroWindValue)) * 100

  return (
    <div className={styles.windEffectContainer}>
      <div className={styles.windEffectRail}>
        <div
          className={styles.resultPercent}
          style={{ width: `${100 - windEffectPercent}%` }}
        />
        <div
          className={styles.windEffectPercent}
          style={{ width: `${windEffectPercent}%` }}
        />
      </div>

      <div className={styles.zeroWindValue} aria-label="wind cancelled value">
        {valuePresenter(zeroWindValue)}
      </div>

      <div className={styles.windEffectValue} aria-label="wind effect">
        {windEffectPresentation(windEffect, valuePresenter)}
      </div>
    </div>
  )
}

WindEffect.propTypes = {
  rawValue: PropTypes.number,
  zeroWindValue: PropTypes.number,
  valuePresenter: PropTypes.func
}

export default WindEffect
