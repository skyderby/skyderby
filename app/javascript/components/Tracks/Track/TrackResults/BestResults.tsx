import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { ResultsRecord } from 'api/tracks/results'
import { formatResult } from './formatResult'
import styles from './styles.module.scss'

type BestResultsProps = {
  results: ResultsRecord['bestResults']
}

const BestResults = ({ results }: BestResultsProps): JSX.Element | null => {
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
            {formatResult(result, task)}
            &nbsp; ({rangeFrom} - {rangeTo})
          </li>
        ))}
      </ul>
    </div>
  )
}

export default BestResults
