import React from 'react'

import styles from './styles.module.scss'

const windEffectPresentation = (
  value: number,
  presenter: ValuePresenter
): string | number => {
  if (value > 0) return `+${presenter(value)}`
  if (value < 0) return `-${presenter(Math.abs(value))}`

  return 0
}

type ValuePresenter = (val: number) => number | string

type WindEffectProps = {
  rawValue: number
  zeroWindValue: number
  valuePresenter?: ValuePresenter
}

const WindEffect = ({
  rawValue,
  zeroWindValue,
  valuePresenter = val => val
}: WindEffectProps): JSX.Element => {
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

export default WindEffect
