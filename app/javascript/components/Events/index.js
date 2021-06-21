import React from 'react'
import { Switch, Route } from 'react-router-dom'

import EventsIndex from './EventsIndex'
import EventTypeSelect from './EventTypeSelect'
import PerformanceCompetition from './PerformanceCompetition'

const Events = () => {
  return (
    <Switch>
      <Route exact path="/events" component={EventsIndex} />
      <Route path="/events/performance" component={PerformanceCompetition} />
      <Route path="/events/new" component={EventTypeSelect} />
    </Switch>
  )
}

export default Events
