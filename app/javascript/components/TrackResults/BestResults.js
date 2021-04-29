import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { formatResult } from './formatResult'

import styles from './styles.module.scss'

const BestResults = ({ results }) => {
  const { t } = useI18n()

  if (results.length === 0) return null

  return (
    <div>
      <h2 className={styles.header}>{t('tracks.show.best_results')}</h2>
      <ul>
        {results.map(({ result, task, rangeFrom, rangeTo }) => (
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
  results: PropTypes.arrayOf(
    PropTypes.shape({
      result: PropTypes.number.isRequired,
      task: PropTypes.oneOf([
        'time',
        'distance',
        'speed',
        'distanceInTime',
        'distanceInAltitude',
        'flare',
        'baseRace'
      ]).isRequired,
      rangeFrom: PropTypes.number,
      rangeTo: PropTypes.number
    })
  )
}

export default BestResults
