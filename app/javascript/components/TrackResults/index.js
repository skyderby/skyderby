import React from 'react'
import PropTypes from 'prop-types'

import { useTrackResults } from 'api/hooks/tracks/results'
import TrackShowContainer from 'components/TrackShowContainer'
import CompetitorResult from './CompetitionResult'
import OnlineRankingResults from './OnlineRankingResults'
import BestResults from './BestResults'
import TotalResults from './TotalResults'

const TrackResults = ({ match }) => {
  const trackId = Number(match.params.id)
  const { data: results, isLoading } = useTrackResults(trackId)

  if (isLoading) return null

  const {
    competitionResult,
    bestResults = [],
    totalResults = [],
    onlineRankingResults = []
  } = results

  return (
    <TrackShowContainer shrinkToContent>
      <CompetitorResult result={competitionResult} />
      <BestResults results={bestResults} />
      <TotalResults results={totalResults} />
      <OnlineRankingResults results={onlineRankingResults} />
    </TrackShowContainer>
  )
}

TrackResults.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default TrackResults
