import React from 'react'

import { useI18n } from 'components/TranslationsProvider'

import styles from './styles.module.scss'

const scaleItems = ['< 130', '130 - 160', '160 - 190', '190 - 220', '220 - 250', '> 250']

const SpeedScale = (): JSX.Element => {
  const { t } = useI18n()

  return (
    <div className={styles.speedScale}>
      {scaleItems.map(item => (
        <div key={item}>
          {item} {t('units.kmh')}
        </div>
      ))}
    </div>
  )
}

export default SpeedScale
