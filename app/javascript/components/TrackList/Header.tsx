import React from 'react'

import { useI18n } from 'components/TranslationsProvider'

import styles from './styles.module.scss'

const Header = (): JSX.Element => {
  const { t } = useI18n()

  return (
    <div className={styles.thead}>
      <div className={styles.tr}>
        <div className={styles.cell}>{t('activerecord.attributes.track.id')}</div>
        <div className={styles.cell}>{t('activerecord.attributes.track.name')}</div>
        <div className={styles.cell}>{t('activerecord.attributes.track.suit')}</div>
        <div className={styles.cell}>{t('activerecord.attributes.track.place')}</div>
        <div className={styles.cell}>{t('activerecord.attributes.track.comment')}</div>
        <div className={styles.cell} data-result="true">
          {t('disciplines.distance')}
        </div>
        <div className={styles.cell} data-result="true">
          {t('disciplines.speed')}
        </div>
        <div className={styles.cell} data-result="true">
          {t('disciplines.time')}
        </div>
        <div className={styles.cell}>
          {t('activerecord.attributes.track.recorded_at')}
        </div>
      </div>
    </div>
  )
}

export default Header
