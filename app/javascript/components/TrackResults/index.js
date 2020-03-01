import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { usePageContext } from 'components/PageContext'
import { loadTrackResults } from 'redux/tracks/results'
import { Container } from './elements'
import CompetitorResult from './CompetitionResult'
import OnlineRankingResults from './OnlineRankingResults'
import BestResults from './BestResults'
import TotalResults from './TotalResults'

const TrackResults = () => {
  const dispatch = useDispatch()
  const { trackId } = usePageContext()

  useEffect(() => {
    dispatch(loadTrackResults(trackId))
  }, [dispatch, trackId])

  return (
    <Container>
      <CompetitorResult trackId={trackId} />
      <BestResults trackId={trackId} />
      <TotalResults trackId={trackId} />
      <OnlineRankingResults trackId={trackId} />
    </Container>
  )
}

export default TrackResults
