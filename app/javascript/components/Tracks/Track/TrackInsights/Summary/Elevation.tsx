import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { metersToFeet } from 'utils/unitsConversion'
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
  const placeholder = '----'
  if (!value || Number.isNaN(value)) return placeholder

  if (unitSystem === METRIC) return Math.round(value)
  if (unitSystem === IMPERIAL) return Math.round(metersToFeet(value))

  return placeholder
}

type ElevationProps = {
  value: number | null
}

const Elevation = ({ value }: ElevationProps): JSX.Element => {
  const { t } = useI18n()
  const {
    viewPreferences: { unitSystem }
  } = useTrackViewPreferences()
  const units = unitSystem === METRIC ? 'm' : 'ft'

  return (
    <div className={styles.summaryItem} data-value="elevation">
      <div className={styles.title}>{t('tracks.indicators.elevation')}</div>
      <div className={styles.valueContainer}>
        <div className={styles.value} aria-label="elevation">
          {valuePresentation(value, unitSystem)}
        </div>
        <div className={styles.units}>{t(`units.${units}`)}</div>
      </div>
    </div>
  )
}

export default Elevation
