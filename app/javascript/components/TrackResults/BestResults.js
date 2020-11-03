import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { selectBestResults } from 'redux/tracks/results'
import { formatResult } from './formatResult'

import styles from './styles.module.scss'

const BestResults = ({ trackId }) => {
  const { t } = useI18n()
  const records = useSelector(state => selectBestResults(state, trackId))

  if (records.length === 0) return null

  return (
    <div>
      <h2 className={styles.header}>{t('tracks.show.best_results')}</h2>
      <ul>
        {records.map(({ result, task, rangeFrom, rangeTo }) => (
          <li key={task}>
            {t(`disciplines.${task}`)}
            :&nbsp;
            {formatResult(result, task, t)}
            &nbsp; ({rangeFrom} - {rangeTo})
          </li>
        ))}
      </ul>
    </div>
  )
}

BestResults.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default BestResults
