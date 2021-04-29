import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { formatResult } from './formatResult'

import styles from './styles.module.scss'

const TotalResults = ({ results }) => {
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
            {formatResult(result, task, t)}
          </li>
        ))}
      </ul>
    </div>
  )
}

TotalResults.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      result: PropTypes.number.isRequired,
      task: PropTypes.string // TODO: Specify one of
    })
  )
}

export default TotalResults
