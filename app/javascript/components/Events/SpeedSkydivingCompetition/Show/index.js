import React from 'react'
import { Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useSpeedSkydivingCompetitionQuery } from 'api/hooks/speedSkydivingCompetitions'
import AppShell from 'components/AppShell'
import Header from './Header'
import Scoreboard from './Scoreboard'
import TeamsScoreboard from './TeamsScoreboard'
import styles from './styles.module.scss'
import PageLoading from 'components/PageWrapper/Loading'

const Show = ({ match }) => {
  const eventId = Number(match.params.eventId)

  const { data: event, isLoading } = useSpeedSkydivingCompetitionQuery(eventId)

  return (
    <AppShell>
      {isLoading ? (
        <PageLoading />
      ) : (
        <div className={styles.container}>
          <Header event={event} />

          <Switch>
            <Route exact path={`${match.path}/`} component={Scoreboard} />
            <Route exact path={`${match.path}/teams`} component={TeamsScoreboard} />
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
