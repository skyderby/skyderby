import React from 'react'
import PropTypes from 'prop-types'

import { useTrackResults } from 'api/hooks/tracks/results'
import PageContainer from 'components/Tracks/Track/PageContainer'
import CompetitorResult from './CompetitionResult'
import OnlineRankingResults from './OnlineRankingResults'
import BestResults from './BestResults'
import TotalResults from './TotalResults'

const TrackResults = ({ trackId }) => {
  const { data: results, isLoading } = useTrackResults(trackId)

  if (isLoading) return null

  const {
    competitionResult,
    bestResults = [],
    totalResults = [],
    onlineRankingResults = []
  } = results

  return (
    <PageContainer shrinkToContent>
      <CompetitorResult result={competitionResult} />
      <BestResults results={bestResults} />
      <TotalResults results={totalResults} />
      <OnlineRankingResults results={onlineRankingResults} />
    </PageContainer>
  )
}

TrackResults.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default TrackResults
