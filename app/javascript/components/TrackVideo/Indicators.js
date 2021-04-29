import React, { useRef, forwardRef, useImperativeHandle } from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { msToKmh } from 'utils/unitsConversion'

import styles from './styles.module.scss'

const valuePlaceholder = '---'
const minorValuePlaceholder = '-'
const valueWithDecimalPlaceholder = '-.--'

const Indicators = forwardRef((_props, ref) => {
  const { t } = useI18n()
  const altitudeMajorRef = useRef()
  const altitudeMinorRef = useRef()
  const hSpeedRef = useRef()
  const vSpeedRef = useRef()
  const glideRatioRef = useRef()

  const setBlankValues = () => {
    altitudeMajorRef.current.innerText = valuePlaceholder
    altitudeMinorRef.current.innerText = minorValuePlaceholder
    vSpeedRef.current.innerText = valuePlaceholder
    hSpeedRef.current.innerText = valuePlaceholder
    glideRatioRef.current.innerText = valueWithDecimalPlaceholder
  }

  const setValues = ({ altitude, vSpeed, hSpeed, glideRatio }) => {
    altitudeMajorRef.current.innerText = Math.floor(altitude / 10).toFixed()
    altitudeMinorRef.current.innerText = (
      altitude - Math.floor((altitude * 10) / 10)
    ).toFixed()
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
        <div>
          <span className={styles.value} ref={altitudeMajorRef}>
            {valuePlaceholder}
          </span>
          <span className={styles.minorValue} ref={altitudeMinorRef}>
            {minorValuePlaceholder}
          </span>
          &nbsp;
          <span className={styles.units}>{t('units.m')}</span>
        </div>
        <div className={styles.title}>{t('tracks.indicators.altitude')}</div>
      </div>
      <div className={styles.valueContainer}>
        <div>
          <span className={styles.value} ref={hSpeedRef}>
            {valuePlaceholder}
          </span>
          &nbsp;
          <span className={styles.units}>{t('units.kmh')}</span>
        </div>
        <div className={styles.title}>{t('tracks.indicators.vertical_speed')}</div>
      </div>
      <div className={styles.valueContainer}>
        <div>
          <span className={styles.value} ref={vSpeedRef}>
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
