import React, { useEffect, useState } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { useQueryClient } from 'react-query'

import {
  usePerformanceCompetitionQuery,
  competitorsQuery,
  categoriesQuery,
  roundsQuery,
  resultsQuery
} from 'api/performanceCompetitions'

import Header from './Header'
import Scoreboard from './Scoreboard'
import TeamsScoreboard from './TeamsScoreboard'
import ReferencePoints from './ReferencePoints'
import Maps from './Maps'
import Replay from './Replay'
import Downloads from './Downloads'
import Edit from './Edit'
import styles from './styles.module.scss'
import PageLoading from 'components/LoadingSpinner'
import ErrorPage from 'components/ErrorPage'

const Show = () => {
  const params = useParams()
  const eventId = Number(params.eventId)
  const queryClient = useQueryClient()
  const [associationsLoaded, setAssociationsLoaded] = useState(false)
  const { data: event, isLoading, isError, error } = usePerformanceCompetitionQuery(
    eventId
  )

  useEffect(() => {
    if (isLoading || isError) return

    Promise.all([
      queryClient.prefetchQuery(categoriesQuery(eventId)),
      queryClient.prefetchQuery(competitorsQuery(eventId, queryClient)),
      queryClient.prefetchQuery(roundsQuery(eventId)),
      queryClient.prefetchQuery(resultsQuery(eventId))
    ]).then(() => setAssociationsLoaded(true))
  }, [eventId, isLoading, isError, queryClient, setAssociationsLoaded])

  if (isLoading) return <PageLoading />
  if (isError) return ErrorPage.forError(error, { linkBack: '/events' })
  if (!event) return null

  return (
    <div className={styles.container}>
      <Header event={event} />

      {associationsLoaded && (
        <Routes>
          <Route index element={<Scoreboard eventId={eventId} />} />
          <Route
            path="reference_points"
            element={<ReferencePoints eventId={eventId} />}
          />
          <Route path="maps" element={<Maps eventId={eventId} />} />
          <Route path="maps/:roundId" element={<Maps eventId={eventId} />} />
          <Route path="replay" element={<Replay eventId={eventId} />} />
          <Route path="replay/:roundId" element={<Replay eventId={eventId} />} />
          <Route path="teams" element={<TeamsScoreboard eventId={eventId} />} />
          <Route path="downloads" element={<Downloads eventId={eventId} />} />
          <Route path="edit" element={<Edit eventId={eventId} />} />
        </Routes>
      )}
    </div>
  )
}

export default Show
