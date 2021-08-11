import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import EventsIndex from './EventsIndex'
import EventTypeSelect from './EventTypeSelect'
import PerformanceCompetition from './PerformanceCompetition'
import SpeedSkydivingCompetition from './SpeedSkydivingCompetition'

const Events = () => {
  return (
    <Switch>
      <Route exact path="/events" component={EventsIndex} />
      <Route exact path="/events/new" component={EventTypeSelect} />
      <Route path="/events/performance" component={PerformanceCompetition} />
      <Route path="/events/speed_skydiving" component={SpeedSkydivingCompetition} />

      <Route component={() => <Redirect to="/events" />} />
    </Switch>
  )
}

export default Events
