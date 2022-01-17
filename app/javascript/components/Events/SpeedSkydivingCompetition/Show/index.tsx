import React, { useEffect, useState } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import { useQueryClient } from 'react-query'

import {
  preloadCategories,
  preloadCompetitors,
  preloadResults,
  preloadRounds,
  preloadTeams,
  useSpeedSkydivingCompetitionQuery,
  preloadStandings
} from 'api/speedSkydivingCompetitions'
import PageLoading from 'components/PageWrapper/Loading'
import ErrorPage from 'components/ErrorPage'
import Header from './Header'
import Scoreboard from './Scoreboard'
import TeamsScoreboard from './TeamsScoreboard'
import OpenScoreboard from './OpenScoreboard'
import Edit from './Edit'
import Downloads from './Downloads'
import styles from './styles.module.scss'

const Show = () => {
  const params = useParams()
  const eventId = Number(params.eventId)
  const queryClient = useQueryClient()
  const [associationsLoaded, setAssociationsLoaded] = useState(false)
  const { data: event, isLoading, isError, error } = useSpeedSkydivingCompetitionQuery(
    eventId
  )

  useEffect(() => {
    if (isLoading || isError) return

    Promise.all([
      preloadCategories(eventId, queryClient),
      preloadRounds(eventId, queryClient),
      preloadCompetitors(eventId, queryClient),
      preloadResults(eventId, queryClient),
      preloadTeams(eventId, queryClient),
      preloadStandings(eventId, queryClient)
    ]).then(() => setAssociationsLoaded(true))
  }, [eventId, isLoading, isError, queryClient])

  if (isLoading) return <PageLoading />
  if (isError) return ErrorPage.forError(error, { linkBack: '/events' })
  if (!event) return null

  return (
    <div className={styles.container}>
      <Header event={event} />

      {associationsLoaded && (
        <Routes>
          <Route index element={<Scoreboard eventId={eventId} />} />
          {event.useOpenScoreboard && (
            <Route path="open_event" element={<OpenScoreboard eventId={eventId} />} />
          )}
          {event.useTeams && (
            <Route path="teams" element={<TeamsScoreboard eventId={eventId} />} />
          )}
          {event.permissions.canDownload && (
            <Route path="downloads" element={<Downloads eventId={eventId} />} />
          )}
          {event.permissions.canEdit && (
            <Route path="edit" element={<Edit eventId={eventId} />} />
          )}
        </Routes>
      )}
    </div>
  )
}

export default Show
