import React, { useEffect } from 'react'
import { Switch, Route, useHistory } from 'react-router-dom'

import Landing from 'components/Landing'
import FlightProfiles from 'pages/FlightProfiles'
import SuitsIndex from 'pages/suits/Index'
import SuitsOverview from 'pages/suits/Overview'
import SuitsShow from 'pages/suits/Show'
import SuitsEdit from 'pages/suits/Edit'
import Places from 'components/Places'
import Events from 'components/Events'
import Tracks from 'components/Tracks'
import Users from 'components/Users'

const reportLocation = location =>
  window.gtag('event', 'page_view', {
    page_path: location.pathname + location.search
  })

const AppRouter = () => {
  const history = useHistory()

  useEffect(() => {
    const unlisten = history.listen(reportLocation)

    reportLocation(history.location)

    return () => unlisten()
  }, [history])

  return (
    <Switch>
      <Route exact path="/" component={Landing} />
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
