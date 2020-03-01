import React from 'react'
import { useSelector } from 'react-redux'
import I18n from 'i18n-js'
import PropTypes from 'prop-types'

import { selectBestResults } from 'redux/tracks/results'
import { formatResult } from './formatResult'
import { Header } from './elements'

const BestResults = ({ trackId }) => {
  const records = useSelector(state => selectBestResults(state, trackId))

  if (records.length === 0) return null

  return (
    <div>
      <Header>{I18n.t('tracks.show.best_results')}</Header>
      <ul>
        {records.map(({ result, task, rangeFrom, rangeTo }) => (
          <li key={task}>
            {I18n.t(`disciplines.${task}`)}
            :&nbsp;
            {formatResult(result, task)}
            &nbsp; ({rangeFrom} - {rangeTo})
          </li>
        ))}
      </ul>
    </div>
  )
}

BestResults.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default BestResults
