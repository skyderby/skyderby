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
import styles from './styles.module.scss'

const valuePresentation = (
  value: number | null,
  unitSystem: UnitSystem
): string | number => {
  const placeholder = '---'
  if (value === null) return placeholder

  if (unitSystem === METRIC) return Math.round(msToKmh(value))
  if (unitSystem === IMPERIAL) return Math.round(msToMph(value))

  return placeholder
}

type VerticalSpeedProps = {
  value: {
    min: number | null
    max: number | null
    avg: number | null
  }
}

const VerticalSpeed = ({ value }: VerticalSpeedProps): JSX.Element => {
  const { t } = useI18n()
  const {
    viewPreferences: { unitSystem }
  } = useTrackViewPreferences()
  const units = unitSystem === METRIC ? 'kmh' : 'mph'

  return (
    <div className={styles.summaryItem} data-value="vertical-speed">
      <div className={styles.title}>{t('tracks.indicators.vertical_speed')}</div>
      <div className={styles.valueContainer}>
        <div className={styles.value} aria-label="average vertical speed">
          {valuePresentation(value.avg, unitSystem)}
        </div>

        <div className={styles.minMaxValue}>
          <div className={styles.min}>
            <span aria-label="maximum vertical speed">
              {valuePresentation(value.max, unitSystem)}
            </span>
            <ChevronUp />
          </div>
          <div className={styles.max}>
            <span aria-label="minimum vertical speed">
              {valuePresentation(value.min, unitSystem)}
            </span>
            <ChevronDown />
          </div>
        </div>

        <div className={styles.units}>{t(`units.${units}`)}</div>
      </div>
    </div>
  )
}

export default VerticalSpeed
