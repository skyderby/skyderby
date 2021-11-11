import React, { useState } from 'react'

import { TrackActivity } from 'api/tracks'
import { useI18n } from 'components/TranslationsProvider'
import CustomRangeModal from './CustomRangeModal'
import styles from './styles.module.scss'

type RangeShortcutsProps = {
  activity: TrackActivity | undefined
  altitudeRange: readonly number[]
  selectedAltitudeRange: readonly number[]
  onChange: (range: readonly number[]) => void
}

const RangeShortcuts = ({
  activity,
  altitudeRange: [minAltitude, maxAltitude] = [],
  selectedAltitudeRange,
  onChange
}: RangeShortcutsProps): JSX.Element => {
  const { t } = useI18n()
  const [modalShown, setModalShown] = useState(false)

  const setCustomRange = (range: readonly number[]): void => {
    onChange?.(range)
    setModalShown(false)
  }

  const isSkydive = activity === 'skydive'

  return (
    <div className={styles.container}>
      {isSkydive && maxAltitude >= 3000 && minAltitude <= 2000 && (
        <button className={styles.rangeButton} onClick={() => onChange?.([3000, 2000])}>
          3000 – 2000 {t('units.m')}
        </button>
      )}
      {isSkydive && maxAltitude >= 2500 && minAltitude <= 1500 && (
        <button className={styles.rangeButton} onClick={() => onChange?.([2500, 1500])}>
          2500 – 1500 {t('units.m')}
        </button>
      )}

      <button className={styles.rangeButton} onClick={() => setModalShown(true)}>
        Custom range
      </button>

      <button
        className={styles.rangeButton}
        onClick={() => onChange?.([maxAltitude, minAltitude])}
      >
        Full jump
      </button>

      <CustomRangeModal
        minAltitude={minAltitude}
        maxAltitude={maxAltitude}
        selectedAltitudeRange={selectedAltitudeRange}
        isShown={modalShown}
        onHide={() => setModalShown(false)}
        onChange={setCustomRange}
      />
    </div>
  )
}

export default RangeShortcuts
