import React from 'react'
import { Link } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import { formatResult } from './formatResult'

import styles from './styles.module.scss'
import { ResultsRecord } from 'api/tracks/results'

type OnlineRankingResults = {
  results: ResultsRecord['onlineRankingResults']
}

const OnlineRankingResults = ({ results }: OnlineRankingResults): JSX.Element | null => {
  const { t } = useI18n()

  if (results.length === 0) return null

  return (
    <div>
      <h2 className={styles.header}>{t('tracks.show.online_comp_results')}</h2>
      <ul>
        {results.map(record => (
          <li key={record.rankingId}>
            <Link to={`/online_rankings/${record.rankingId}`}>
              {[record.groupName, record.rankingName].filter(Boolean).join(' - ')}
            </Link>
            :&nbsp;
            {formatResult(record.result, record.task)}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OnlineRankingResults
