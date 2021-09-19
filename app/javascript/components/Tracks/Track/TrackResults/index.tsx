import React from 'react'
import { match } from 'react-router-dom'

import { useTrackResults } from 'api/hooks/tracks/results'
import PageContainer from 'components/Tracks/Track/PageContainer'
import CompetitionResult from './CompetitionResult'
import OnlineRankingResults from './OnlineRankingResults'
import BestResults from './BestResults'
import TotalResults from './TotalResults'

type TrackResults = {
  match: match<{ id: string }>
}

const TrackResults = ({ match }: TrackResults): JSX.Element | null => {
  const trackId = Number(match.params.id)
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
