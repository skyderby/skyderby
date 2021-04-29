import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { formatResult } from './formatResult'

import styles from './styles.module.scss'

const OnlineRankingResults = ({ results }) => {
  const { t } = useI18n()

  if (results.length === 0) return null

  return (
    <div>
      <h2 className={styles.header}>{t('tracks.show.online_comp_results')}</h2>
      <ul>
        {results.map(record => (
          <li key={record.id}>
            <Link to={record.rankingPath}>
              {[record.groupName, record.rankingName].filter(el => el).join(' - ')}
            </Link>
            :&nbsp;
            {formatResult(record.result, record.task, t)}
          </li>
        ))}
      </ul>
    </div>
  )
}

OnlineRankingResults.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      rankingPath: PropTypes.string.isRequired,
      rankingName: PropTypes.string.isRequired,
      result: PropTypes.number.isRequired,
      task: PropTypes.oneOf([
        'time',
        'distance',
        'speed',
        'distanceInTime',
        'distanceInAltitude',
        'flare',
        'baseRace'
      ]).isRequired
    })
  )
}

export default OnlineRankingResults
