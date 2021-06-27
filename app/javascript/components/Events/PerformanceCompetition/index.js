import React from 'react'
import { Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'

import NewEvent from './NewEvent'
import Show from './Show'

const PerformanceCompetition = ({ match }) => (
  <Switch>
    <Route exact path={`${match.path}/new`} component={NewEvent} />
    <Route path={`${match.path}/:id`} component={Show} />
  </Switch>
)

PerformanceCompetition.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired
  }).isRequired
}

export default PerformanceCompetition
