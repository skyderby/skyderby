import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { afterExitColor, windowStartColor, windowEndColor } from '../constants'

import styles from './styles.module.scss'

type LegendProps = {
  rangeFrom: number
  rangeTo: number
}

const Legend = ({ rangeFrom, rangeTo }: LegendProps) => {
  const { t } = useI18n()

  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <div className={styles.circle} style={{ backgroundColor: afterExitColor }} />
        &nbsp; &mdash; &nbsp;
        {t('events.rounds.map.after_exit_description')}
      </div>
      <div className={styles.item}>
        <div className={styles.circle} style={{ backgroundColor: windowStartColor }} />
        &nbsp; &mdash; &nbsp;
        {rangeFrom} {t('units.m')}
      </div>
      <div className={styles.item}>
        <div className={styles.circle} style={{ backgroundColor: windowEndColor }} />
        &nbsp; &mdash; &nbsp;
        {rangeTo} {t('units.m')}
      </div>
    </div>
  )
}

export default Legend
