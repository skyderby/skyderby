import React from 'react'
import { useSelector } from 'react-redux'

import { useI18n } from 'components/TranslationsProvider'
import { afterExitColor, windowStartColor, windowEndColor } from '../../constants'

import styles from './styles.module.scss'

const Legend = () => {
  const { t } = useI18n()
  const { rangeFrom, rangeTo } = useSelector(state => state.eventRound.event)

  return (
    <div>
      <div className={styles.item}>
        <div className={styles.circle} style={{ backgroundColor: afterExitColor }} />
        &nbsp; &mdash; &nbsp;
        {t('events.rounds.map.after_exit_description')}
      </div>
      <div className={styles.item}>
        <div className={styles.circle} style={{ backgroundColor: windowStartColor }} />
        &nbsp; &mdash; &nbsp;
        {t('events.rounds.map.start_window_description', { altitude: rangeFrom })}
      </div>
      <div className={styles.item}>
        <div className={styles.circle} style={{ backgroundColor: windowEndColor }} />
        &nbsp; &mdash; &nbsp;
        {t('events.rounds.map.end_window_description', { altitude: rangeTo })}
      </div>
    </div>
  )
}

export default Legend
