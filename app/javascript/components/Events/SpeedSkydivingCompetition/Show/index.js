import React, { useEffect, useState } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import PropTypes from 'prop-types'

import {
  preloadCategories,
  preloadCompetitors,
  preloadResults,
  preloadRounds,
  preloadSpeedSkydivingCompetition,
  preloadTeams,
  useSpeedSkydivingCompetitionQuery,
  preloadStandings
} from 'api/hooks/speedSkydivingCompetitions'
import AppShell from 'components/AppShell'
import Header from './Header'
import Scoreboard from './Scoreboard'
import TeamsScoreboard from './TeamsScoreboard'
import OpenScoreboard from './OpenScoreboard'
import styles from './styles.module.scss'
import PageLoading from 'components/PageWrapper/Loading'

const Show = ({ match }) => {
  const eventId = Number(match.params.eventId)
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(true)
  const { data: event } = useSpeedSkydivingCompetitionQuery(eventId)

  useEffect(() => {
    Promise.all([
      preloadSpeedSkydivingCompetition(eventId, queryClient),
      preloadCategories(eventId, queryClient),
      preloadRounds(eventId, queryClient),
      preloadCompetitors(eventId, queryClient),
      preloadResults(eventId, queryClient),
      preloadTeams(eventId, queryClient),
      preloadStandings(eventId, queryClient)
    ]).then(() => setIsLoading(false))
  }, [eventId])

  return (
    <AppShell>
      {isLoading ? (
        <PageLoading />
      ) : (
        <div className={styles.container}>
          <Header event={event} />

          <Switch>
            <Route exact path={`${match.path}/`} component={Scoreboard} />
            {event.useOpenScoreboard && (
              <Route exact path={`${match.path}/open_event`} component={OpenScoreboard} />
            )}
            {event.useTeams && (
              <Route exact path={`${match.path}/teams`} component={TeamsScoreboard} />
            )}
          </Switch>
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
