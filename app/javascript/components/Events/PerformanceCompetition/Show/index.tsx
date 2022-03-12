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
import ReferencePoints from './ReferencePoints'
import Maps from './Maps'
import styles from './styles.module.scss'
import PageLoading from 'components/PageWrapper/Loading'

const Show = () => {
  const params = useParams()
  const eventId = Number(params.eventId)
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(true)
  const { data: event } = usePerformanceCompetitionQuery(eventId)

  useEffect(() => {
    Promise.all([
      queryClient.prefetchQuery(categoriesQuery(eventId)),
      queryClient.prefetchQuery(competitorsQuery(eventId, queryClient)),
      queryClient.prefetchQuery(roundsQuery(eventId)),
      queryClient.prefetchQuery(resultsQuery(eventId))
    ]).then(() => setIsLoading(false))
  }, [eventId, queryClient, setIsLoading])

  if (!event || isLoading) return <PageLoading />

  return (
    <div className={styles.container}>
      <Header event={event} />

      <Routes>
        <Route index element={<Scoreboard eventId={eventId} />} />
        <Route path="reference_points" element={<ReferencePoints eventId={eventId} />} />
        <Route path="maps" element={<Maps eventId={eventId} />} />
        <Route path="maps/:roundId" element={<Maps eventId={eventId} />} />
      </Routes>
    </div>
  )
}

export default Show
