import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import CustomRangeModal from './CustomRangeModal'

import styles from './styles.module.scss'

const RangeShortcuts = ({
  activity,
  altitudeRange: [minAltitude, maxAltitude] = [],
  selectedAltitudeRange,
  onChange
}) => {
  const { t } = useI18n()
  const [modalShown, setModalShown] = useState(false)

  const setCustomRange = range => {
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

RangeShortcuts.propTypes = {
  activity: PropTypes.oneOf(['skydive', 'base']),
  altitudeRange: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedAltitudeRange: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func
}

export default RangeShortcuts
