import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { msToKmh, msToMph } from 'utils/unitsConversion'
import ChevronDown from 'icons/chevron-down.svg'
import ChevronUp from 'icons/chevron-up.svg'
import {
  useTrackViewPreferences,
  METRIC,
  IMPERIAL,
  UnitSystem
} from 'components/TrackViewPreferences'
import WindEffect from './WindEffect'
import styles from './styles.module.scss'

const valuePresentation = (
  value: number | null,
  unitSystem: UnitSystem
): string | number => {
  const placeholder = '---'
  if (!value || Number.isNaN(value)) return placeholder

  if (unitSystem === METRIC) return Math.round(msToKmh(value))
  if (unitSystem === IMPERIAL) return Math.round(msToMph(value))

  return placeholder
}

type HorizontalSpeedProps = {
  value: {
    min: number | null
    max: number | null
    avg: number | null
  }
  zeroWindValue: number | null
}

const HorizontalSpeed = ({ value, zeroWindValue }: HorizontalSpeedProps): JSX.Element => {
  const { t } = useI18n()
  const {
    viewPreferences: { unitSystem }
  } = useTrackViewPreferences()
  const units = unitSystem === METRIC ? 'kmh' : 'mph'
  const { min, max, avg } = value
  const showWindEffect = avg && zeroWindValue

  return (
    <div className={styles.summaryItem} data-value="ground-speed">
      <div className={styles.title}>{t('tracks.indicators.ground_speed')}</div>
      <div className={styles.valueContainer}>
        <div className={styles.value} aria-label="average horizontal speed">
          {valuePresentation(avg, unitSystem)}
        </div>
        <div className={styles.minMaxValue}>
          <div className={styles.max}>
            <span aria-label="maximum horizontal speed">
              {valuePresentation(max, unitSystem)}
            </span>
            <ChevronUp />
          </div>
          <div className={styles.min}>
            <span aria-label="minimum horizontal speed">
              {valuePresentation(min, unitSystem)}
            </span>
            <ChevronDown />
          </div>
        </div>
        <div className={styles.units}>{t(`units.${units}`)}</div>
      </div>

      {showWindEffect && (
        <WindEffect
          rawValue={avg}
          zeroWindValue={zeroWindValue}
          valuePresenter={val => valuePresentation(val, unitSystem)}
        />
      )}
    </div>
  )
}

export default HorizontalSpeed
