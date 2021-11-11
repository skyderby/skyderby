import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { ResultsRecord } from 'api/tracks/results'
import { formatResult } from './formatResult'
import styles from './styles.module.scss'

type TotalResultsProps = {
  results: ResultsRecord['totalResults']
}

const TotalResults = ({ results }: TotalResultsProps): JSX.Element | null => {
  const { t } = useI18n()

  if (results.length === 0) return null

  return (
    <div>
      <h2 className={styles.header}>{t('tracks.show.overall_results')}</h2>
      <ul>
        {results.map(({ result, task }) => (
          <li key={task}>
            {t(`disciplines.${task}`)}
            :&nbsp;
            {formatResult(result, task)}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TotalResults
