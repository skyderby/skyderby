import React from 'react'
import { Switch, Route } from 'react-router-dom'
import PropTypes from 'prop-types'

import { usePerformanceEventQuery } from 'api/hooks/performanceCompetitions'
import AppShell from 'components/AppShell'
import Header from './Header'
import Scoreboard from './Scoreboard'
import ReferencePoints from './ReferencePoints'

const Show = ({ match }) => {
  const eventId = Number(match.params.id)

  const { data: event } = usePerformanceEventQuery(eventId)

  return (
    <AppShell>
      <div>
        <Header event={event} />

        <Switch>
          <Route exact path={`${match.path}/`}>
            <Scoreboard eventId={eventId} />
          </Route>
          <Route path={`${match.path}/reference_points`}>
            <ReferencePoints eventId={eventId} />
          </Route>
        </Switch>
      </div>
    </AppShell>
  )
}

Show.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired,
    path: PropTypes.string.isRequired
  }).isRequired
}

export default Show
