import React, { useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import PropTypes from 'prop-types'

import {
  preloadCategories,
  preloadCompetitors,
  preloadResults,
  preloadRounds,
  preloadTeams,
  useSpeedSkydivingCompetitionQuery,
  preloadStandings
} from 'api/speedSkydivingCompetitions'
import AppShell from 'components/AppShell'
import PageLoading from 'components/PageWrapper/Loading'
import ErrorPage from 'components/ErrorPage'
import Header from './Header'
import Scoreboard from './Scoreboard'
import TeamsScoreboard from './TeamsScoreboard'
import OpenScoreboard from './OpenScoreboard'
import Edit from './Edit'
import Downloads from './Downloads'
import styles from './styles.module.scss'

const Show = ({ match }) => {
  const eventId = Number(match.params.eventId)
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
  }, [eventId, isLoading, queryClient])

  if (isError) return ErrorPage.forError(error, { linkBack: '/events' })

  return (
    <AppShell>
      {isLoading ? (
        <PageLoading />
      ) : (
        <div className={styles.container}>
          <Header event={event} />

          {associationsLoaded && (
            <Switch>
              <Route exact path={`${match.path}/`} component={Scoreboard} />
              {event.useOpenScoreboard && (
                <Route path={`${match.path}/open_event`} component={OpenScoreboard} />
              )}
              {event.useTeams && (
                <Route path={`${match.path}/teams`} component={TeamsScoreboard} />
              )}
              {event.permissions.canEdit && (
                <>
                  <Route path={`${match.path}/downloads`} component={Downloads} />
                  <Route path={`${match.path}/edit`} component={Edit} />
                </>
              )}
            </Switch>
          )}
        </div>
      )}
    </AppShell>
  )
}

Show.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      eventId: PropTypes.string.isRequired
    }).isRequired,
    path: PropTypes.string.isRequired
  }).isRequired
}

export default Show
