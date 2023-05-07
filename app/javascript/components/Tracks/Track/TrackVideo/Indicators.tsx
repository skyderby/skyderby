import React, { useRef, forwardRef, useImperativeHandle } from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { msToKmh } from 'utils/unitsConversion'

import styles from './styles.module.scss'
import { PointRecord } from 'api/tracks/points'

const valuePlaceholder = '---'
const valueWithDecimalPlaceholder = '-.-'

const valueWithStep = (value: number, step: number) => Math.floor(value / step) * step
const degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180)

const Indicators = forwardRef((_props, ref) => {
  const { t } = useI18n()
  const altitudeRef = useRef<HTMLSpanElement>(null)
  const fullSpeedRef = useRef<HTMLSpanElement>(null)
  const hSpeedRef = useRef<HTMLSpanElement>(null)
  const vSpeedRef = useRef<HTMLSpanElement>(null)
  const glideRatioRef = useRef<HTMLDivElement>(null)
  const glideAngleRef = useRef<SVGPathElement>(null)

  const setBlankValues = () => {
    if (altitudeRef.current) altitudeRef.current.innerText = valuePlaceholder
    if (fullSpeedRef.current) fullSpeedRef.current.innerText = valuePlaceholder
    if (vSpeedRef.current) vSpeedRef.current.innerText = valuePlaceholder
    if (hSpeedRef.current) hSpeedRef.current.innerText = valuePlaceholder
    if (glideRatioRef.current)
      glideRatioRef.current.innerText = valueWithDecimalPlaceholder
  }

  const setValues = ({
    altitude,
    fullSpeed,
    vSpeed,
    hSpeed,
    glideRatio
  }: Partial<PointRecord>): void => {
    if (altitudeRef.current && altitude !== undefined) {
      altitudeRef.current.innerText = (Math.round(altitude / 10) * 10).toFixed()
    }
    if (fullSpeedRef.current && fullSpeed !== undefined) {
      fullSpeedRef.current.innerText = valueWithStep(msToKmh(fullSpeed), 5).toFixed()
    }
    if (vSpeedRef.current && vSpeed !== undefined) {
      vSpeedRef.current.innerText = valueWithStep(msToKmh(vSpeed), 5).toFixed()
    }
    if (hSpeedRef.current && hSpeed !== undefined) {
      hSpeedRef.current.innerText = valueWithStep(msToKmh(hSpeed), 5).toFixed()
    }
    if (glideRatioRef.current && glideRatio !== undefined) {
      glideRatioRef.current.innerText = glideRatio.toFixed(1)
    }
    if (glideAngleRef.current && vSpeed !== undefined && hSpeed !== undefined) {
      const angle = degreesToRadians(90) - Math.atan2(vSpeed, hSpeed)
      const startX = 15 * Math.sin(angle)
      const startY = 115 + 15 * Math.cos(angle)
      const endX = 65 * Math.sin(angle)
      const endY = 115 + 65 * Math.cos(angle)
      glideAngleRef.current.setAttribute('d', `M ${startX} ${startY} ${endX} ${endY}`)
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
          <span className={styles.value} ref={fullSpeedRef}>
            {valuePlaceholder}
          </span>
          &nbsp;
          <span className={styles.units}>{t('units.kmh')}</span>
        </div>
        <div className={styles.title}>{t('tracks.indicators.full_speed')}</div>
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
        <div>
          <span className={styles.value} ref={vSpeedRef}>
            {valuePlaceholder}
          </span>
          &nbsp;
          <span className={styles.units}>{t('units.kmh')}</span>
        </div>
        <div className={styles.title}>{t('tracks.indicators.vertical_speed')}</div>
      </div>

      <div className={styles.glideContainer}>
        <div className={styles.value} ref={glideRatioRef}>
          {valueWithDecimalPlaceholder}
        </div>
        <svg className={styles.angle} viewBox="0 0 240 240">
          <defs>
            <marker
              id="head"
              orient="auto"
              markerWidth="3"
              markerHeight="4"
              refX="0.1"
              refY="2"
            >
              <path d="M0,0 V4 L2,2 Z" fill="var(--blue-grey-70)" />
            </marker>
          </defs>

          <path
            fill="transparent"
            strokeWidth="20"
            stroke="var(--blue-70)"
            d=" M 0 20 A 100 100 0 0 1 0 220"
          />
          <path
            ref={glideAngleRef}
            stroke="var(--blue-grey-70)"
            strokeWidth="14"
            markerEnd="url(#head)"
            d="M 15 117 65 117"
          />
        </svg>

        <div className={styles.title}>{t('tracks.indicators.glide_ratio')}</div>
      </div>
    </div>
  )
})

Indicators.displayName = 'Indicators'

export default Indicators
