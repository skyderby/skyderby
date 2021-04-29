import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { formatResult } from './formatResult'

import styles from './styles.module.scss'

const CompetitionResult = ({ result }) => {
  const { t } = useI18n()

  if (!result) return null

  return (
    <div>
      <h2 className={styles.header}>{t('tracks.show.comp_result')}</h2>
      <ul>
        <li>
          <Link to={result.eventPath}>{result.eventName}</Link>
          :&nbsp;
          {formatResult(result.result, result.task, t)}
        </li>
      </ul>
    </div>
  )
}

CompetitionResult.propTypes = {
  result: PropTypes.shape({
    eventPath: PropTypes.string.isRequired,
    eventName: PropTypes.string.isRequired,
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
}

export default CompetitionResult
