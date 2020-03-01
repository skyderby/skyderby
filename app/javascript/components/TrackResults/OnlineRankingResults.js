import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { selectOnlineRankingResults } from 'redux/tracks/results'
import { formatResult } from './formatResult'
import { Header } from './elements'

const CompetitionResult = ({ trackId }) => {
  const records = useSelector(state => selectOnlineRankingResults(state, trackId))

  if (records.length === 0) return null

  return (
    <div>
      <Header>{I18n.t('tracks.show.online_comp_results')}</Header>
      <ul>
        {records.map(record => (
          <li key={record.id}>
            <a href={record.rankingPath}>
              {[record.groupName, record.rankingName].filter(el => el).join(' - ')}
            </a>
            :&nbsp;
            {formatResult(record.result, record.task)}
          </li>
        ))}
      </ul>
    </div>
  )
}

CompetitionResult.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default CompetitionResult
