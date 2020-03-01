import React from 'react'
import { useSelector } from 'react-redux'
import I18n from 'i18n-js'
import PropTypes from 'prop-types'

import { selectTotalResults } from 'redux/tracks/results'
import { formatResult } from './formatResult'
import { Header } from './elements'

const TotalResults = ({ trackId }) => {
  const records = useSelector(state => selectTotalResults(state, trackId))

  if (records.length === 0) return null

  return (
    <div>
      <Header>{I18n.t('tracks.show.overall_results')}</Header>
      <ul>
        {records.map(({ result, task }) => (
          <li key={task}>
            {I18n.t(`disciplines.${task}`)}
            :&nbsp;
            {formatResult(result, task)}
          </li>
        ))}
      </ul>
    </div>
  )
}

TotalResults.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default TotalResults
