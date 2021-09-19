import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { metersToMiles } from 'utils/unitsConversion'
import {
  useTrackViewPreferences,
  METRIC,
  IMPERIAL,
  UnitSystem
} from 'components/TrackViewPreferences'
import WindEffect from './WindEffect'
import styles from './styles.module.scss'

const valuePresentation = (value: number | null, unitSystem: UnitSystem) => {
  const placeholder = unitSystem === METRIC ? '----' : '-.---'
  if (!value || Number.isNaN(value)) return placeholder

  if (unitSystem === METRIC) return Math.round(value)
  if (unitSystem === IMPERIAL) return Math.round(metersToMiles(value) * 1000) / 1000

  return placeholder
}

type DistanceProps = {
  value: number | null
  zeroWindValue: number | null
}

const Distance = ({ value, zeroWindValue }: DistanceProps): JSX.Element => {
  const { t } = useI18n()
  const {
    viewPreferences: { unitSystem }
  } = useTrackViewPreferences()
  const units = unitSystem === METRIC ? 'm' : 'mi'

  const showWindEffect = zeroWindValue && value

  return (
    <div className={styles.summaryItem} data-value="distance">
      <div className={styles.title}>{t('tracks.indicators.distance')}</div>
      <div className={styles.valueContainer}>
        <div className={styles.value} aria-label="distance">
          {valuePresentation(value, unitSystem)}
        </div>
        <div className={styles.units}>{t(`units.${units}`)}</div>
      </div>

      {showWindEffect && (
        <WindEffect
          rawValue={value}
          zeroWindValue={zeroWindValue}
          valuePresenter={val => valuePresentation(val, unitSystem)}
        />
      )}
    </div>
  )
}

export default Distance
