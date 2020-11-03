import React, { useRef, forwardRef, useImperativeHandle } from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { msToKmh } from 'utils/unitsConversion'

import styles from './styles.module.scss'

const altitudePlaceholder = '----'
const speedPlaceholder = '---'
const glideRatioPlaceholder = '-.--'

const Indicators = forwardRef((_props, ref) => {
  const { t } = useI18n()
  const altitudeRef = useRef()
  const hSpeedRef = useRef()
  const vSpeedRef = useRef()
  const glideRatioRef = useRef()

  const setBlankValues = () => {
    altitudeRef.current.innerText = altitudePlaceholder
    vSpeedRef.current.innerText = speedPlaceholder
    hSpeedRef.current.innerText = speedPlaceholder
    glideRatioRef.current.innerText = glideRatioPlaceholder
  }

  const setValues = ({ altitude, vSpeed, hSpeed, glideRatio }) => {
    altitudeRef.current.innerText = altitude.toFixed()
    vSpeedRef.current.innerText = msToKmh(vSpeed).toFixed()
    hSpeedRef.current.innerText = msToKmh(hSpeed).toFixed()
    glideRatioRef.current.innerText = glideRatio.toFixed(2)
  }

  useImperativeHandle(ref, () => ({
    setData: data => {
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
        <div className={styles.value} ref={altitudeRef}>
          {altitudePlaceholder}
        </div>
        <div className={styles.title}>{t('tracks.indicators.altitude')}</div>
      </div>
      <div className={styles.valueContainer}>
        <div className={styles.value} ref={hSpeedRef}>
          {speedPlaceholder}
        </div>
        <div className={styles.title}>{t('tracks.indicators.vertical_speed')}</div>
      </div>
      <div className={styles.valueContainer}>
        <div className={styles.value} ref={vSpeedRef}>
          {speedPlaceholder}
        </div>
        <div className={styles.title}>{t('tracks.indicators.ground_speed')}</div>
      </div>
      <div className={styles.valueContainer}>
        <div className={styles.value} ref={glideRatioRef}>
          {glideRatioPlaceholder}
        </div>
        <div className={styles.title}>{t('tracks.indicators.glide_ratio')}</div>
      </div>
    </div>
  )
})

Indicators.displayName = 'Indicators'

export default Indicators
