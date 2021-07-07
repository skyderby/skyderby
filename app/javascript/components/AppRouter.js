import React from 'react'
import { Switch, Route } from 'react-router-dom'

import Home from 'pages/Home'
import FlightProfiles from 'pages/FlightProfiles'
import SuitsIndex from 'pages/suits/Index'
import SuitsOverview from 'pages/suits/Overview'
import SuitsShow from 'pages/suits/Show'
import SuitsEdit from 'pages/suits/Edit'
import Places from 'components/Places'
import Events from 'components/Events'
import Tracks from 'components/Tracks'
import Users from 'components/Users'

const AppRouter = () => {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/flight_profiles" component={FlightProfiles} />
      <Route path="/tracks" component={Tracks} />
      <Route path="/events" component={Events} />
      <Route path="/places" component={Places} />
      <Route path="/users" component={Users} />

      <Route exact path="/suits" component={SuitsOverview} />
      <Route path="/suits/make/:id" component={SuitsIndex} />
      <Route path="/suits/:id/edit" component={SuitsEdit} />
      <Route path="/suits/:id" component={SuitsShow} />
    </Switch>
  )
}

export default AppRouter
