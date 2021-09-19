import React, { useRef, forwardRef, useImperativeHandle } from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { msToKmh } from 'utils/unitsConversion'

import styles from './styles.module.scss'
import { PointRecord } from 'api/hooks/tracks/points'

const valuePlaceholder = '---'
const valueWithDecimalPlaceholder = '-.-'

const Indicators = forwardRef((_props, ref) => {
  const { t } = useI18n()
  const altitudeRef = useRef<HTMLSpanElement>(null)
  const hSpeedRef = useRef<HTMLSpanElement>(null)
  const vSpeedRef = useRef<HTMLSpanElement>(null)
  const glideRatioRef = useRef<HTMLDivElement>(null)

  const setBlankValues = () => {
    if (altitudeRef.current) altitudeRef.current.innerText = valuePlaceholder
    if (vSpeedRef.current) vSpeedRef.current.innerText = valuePlaceholder
    if (hSpeedRef.current) hSpeedRef.current.innerText = valuePlaceholder
    if (glideRatioRef.current)
      glideRatioRef.current.innerText = valueWithDecimalPlaceholder
  }

  const setValues = ({
    altitude,
    vSpeed,
    hSpeed,
    glideRatio
  }: Partial<PointRecord>): void => {
    if (altitudeRef.current && altitude !== undefined) {
      altitudeRef.current.innerText = (Math.round(altitude / 10) * 10).toFixed()
    }
    if (vSpeedRef.current && vSpeed !== undefined) {
      vSpeedRef.current.innerText = msToKmh(vSpeed).toFixed()
    }
    if (hSpeedRef.current && hSpeed !== undefined) {
      hSpeedRef.current.innerText = msToKmh(hSpeed).toFixed()
    }
    if (glideRatioRef.current && glideRatio !== undefined) {
      glideRatioRef.current.innerText = glideRatio.toFixed(1)
    }
  }

  useImperativeHandle(ref, () => ({
    setData: (data: Partial<PointRecord> | null): void => {
      if (data) {
        setValues(data)
      } else {
        setBlankValues()
      }
    }
  }))

  return (
    <div className={styles.indicators}>
      <div className={styles.valueContainer}>
        <div>
          <span className={styles.value} ref={altitudeRef}>
            {valuePlaceholder}
          </span>
          &nbsp;
          <span className={styles.units}>{t('units.m')}</span>
        </div>
        <div className={styles.title}>{t('tracks.indicators.altitude')}</div>
      </div>
      <div className={styles.valueContainer}>
        <div>
          <span className={styles.value} ref={vSpeedRef}>
            {valuePlaceholder}
          </span>
          &nbsp;
          <span className={styles.units}>{t('units.kmh')}</span>
        </div>
        <div className={styles.title}>{t('tracks.indicators.vertical_speed')}</div>
      </div>
      <div className={styles.valueContainer}>
        <div>
          <span className={styles.value} ref={hSpeedRef}>
            {valuePlaceholder}
          </span>
          &nbsp;
          <span className={styles.units}>{t('units.kmh')}</span>
        </div>
        <div className={styles.title}>{t('tracks.indicators.ground_speed')}</div>
      </div>
      <div className={styles.valueContainer}>
        <div className={styles.value} ref={glideRatioRef}>
          {valueWithDecimalPlaceholder}
        </div>
        <div className={styles.title}>{t('tracks.indicators.glide_ratio')}</div>
      </div>
    </div>
  )
})

Indicators.displayName = 'Indicators'

export default Indicators
