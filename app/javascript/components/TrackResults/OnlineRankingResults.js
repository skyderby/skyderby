import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { selectOnlineRankingResults } from 'redux/tracks/results'
import { formatResult } from './formatResult'
import { Header } from './elements'

const OnlineRankingResults = ({ trackId }) => {
  const { t } = useI18n()
  const records = useSelector(state => selectOnlineRankingResults(state, trackId))

  if (records.length === 0) return null

  return (
    <div>
      <Header>{t('tracks.show.online_comp_results')}</Header>
      <ul>
        {records.map(record => (
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
  trackId: PropTypes.number.isRequired
}

export default OnlineRankingResults
