import React from 'react'
import { Link } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import { ResultsRecord } from 'api/tracks/results'
import { formatResult } from './formatResult'
import styles from './styles.module.scss'

type CompetitionResultProps = {
  result: ResultsRecord['competitionResult']
}

const CompetitionResult = ({ result }: CompetitionResultProps): JSX.Element | null => {
  const { t } = useI18n()

  if (!result) return null

  const eventPath = `/events/${result.eventType}/${result.eventId}`

  return (
    <div>
      <h2 className={styles.header}>{t('tracks.show.comp_result')}</h2>
      <ul>
        <li>
          <Link to={eventPath}>{result.eventName}</Link>
          :&nbsp;
          {formatResult(result.result, result.task)}
        </li>
      </ul>
    </div>
  )
}

export default CompetitionResult
