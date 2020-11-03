import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { selectTotalResults } from 'redux/tracks/results'
import { formatResult } from './formatResult'

import styles from './styles.module.scss'

const TotalResults = ({ trackId }) => {
  const { t } = useI18n()
  const records = useSelector(state => selectTotalResults(state, trackId))

  if (records.length === 0) return null

  return (
    <div>
      <h2 className={styles.header}>{t('tracks.show.overall_results')}</h2>
      <ul>
        {records.map(({ result, task }) => (
          <li key={task}>
            {t(`disciplines.${task}`)}
            :&nbsp;
            {formatResult(result, task, t)}
          </li>
        ))}
      </ul>
    </div>
  )
}

TotalResults.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default TotalResults
