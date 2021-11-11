import React, { useEffect, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import PropTypes from 'prop-types'

import {
  usePerformanceEventQuery,
  preloadPerformanceEvent,
  preloadRounds,
  preloadResults,
  preloadCategories,
  preloadCompetitors
} from 'api/hooks/performanceCompetitions'

import AppShell from 'components/AppShell'
import Header from './Header'
import Scoreboard from './Scoreboard'
import ReferencePoints from './ReferencePoints'
import Maps from './Maps'
import styles from './styles.module.scss'
import PageLoading from 'components/PageWrapper/Loading'

const Show = ({ match }) => {
  const eventId = Number(match.params.eventId)
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(true)
  const { data: event } = usePerformanceEventQuery(eventId)

  useEffect(() => {
    Promise.all([
      preloadCategories(eventId, queryClient),
      preloadRounds(eventId, queryClient),
      preloadCompetitors(eventId, queryClient),
      preloadResults(eventId, queryClient)
    ]).then(() => setIsLoading(false))
  }, [eventId, queryClient, setIsLoading])

  return (
    <AppShell>
      {!event || isLoading ? (
        <PageLoading />
      ) : (
        <div className={styles.container}>
          <Header event={event} />

          <Switch>
            <Route exact path={`${match.path}/`} component={Scoreboard} />
            <Route path={`${match.path}/reference_points`} component={ReferencePoints} />
            <Route path={`${match.path}/maps/:roundId?`} component={Maps} />
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
