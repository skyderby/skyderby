import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { selectCompetitionResult } from 'redux/tracks/results'
import { formatResult } from './formatResult'
import { Header } from './elements'

const CompetitionResult = ({ trackId }) => {
  const competitionResult = useSelector(state => selectCompetitionResult(state, trackId))

  if (!competitionResult) return null

  return (
    <div>
      <Header>{I18n.t('tracks.show.comp_result')}</Header>
      <ul>
        <li>
          <Link to={competitionResult.eventPath}>{competitionResult.eventName}</Link>
          :&nbsp;
          {formatResult(competitionResult.result, competitionResult.task)}
        </li>
      </ul>
    </div>
  )
}

CompetitionResult.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default CompetitionResult
