import React, { useRef, forwardRef, useImperativeHandle } from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { msToKmh } from 'utils/unitsConversion'

import styles from './styles.module.scss'

const valuePlaceholder = '---'
const valueWithDecimalPlaceholder = '-.-'

const Indicators = forwardRef((_props, ref) => {
  const { t } = useI18n()
  const altitudeRef = useRef()
  const hSpeedRef = useRef()
  const vSpeedRef = useRef()
  const glideRatioRef = useRef()

  const setBlankValues = () => {
    altitudeRef.current.innerText = valuePlaceholder
    vSpeedRef.current.innerText = valuePlaceholder
    hSpeedRef.current.innerText = valuePlaceholder
    glideRatioRef.current.innerText = valueWithDecimalPlaceholder
  }

  const setValues = ({ altitude, vSpeed, hSpeed, glideRatio }) => {
    altitudeRef.current.innerText = Math.round(altitude / 10) * 10
    vSpeedRef.current.innerText = msToKmh(vSpeed).toFixed()
    hSpeedRef.current.innerText = msToKmh(hSpeed).toFixed()
    glideRatioRef.current.innerText = glideRatio.toFixed(1)
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
