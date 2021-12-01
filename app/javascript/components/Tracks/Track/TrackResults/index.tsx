import React from 'react'

import { useTrackResults } from 'api/tracks/results'
import PageContainer from 'components/Tracks/Track/PageContainer'
import CompetitionResult from './CompetitionResult'
import OnlineRankingResults from './OnlineRankingResults'
import BestResults from './BestResults'
import TotalResults from './TotalResults'

type TrackResultsProps = {
  trackId: number
}

const TrackResults = ({ trackId }: TrackResultsProps): JSX.Element | null => {
  const { data: results, isLoading } = useTrackResults(trackId)

  if (isLoading || !results) return null

  const {
    competitionResult,
    bestResults = [],
    totalResults = [],
    onlineRankingResults = []
  } = results

  return (
    <PageContainer shrinkToContent>
      <CompetitionResult result={competitionResult} />
      <BestResults results={bestResults} />
      <TotalResults results={totalResults} />
      <OnlineRankingResults results={onlineRankingResults} />
    </PageContainer>
  )
}

export default TrackResults
