import React, { useEffect } from 'react'
import { Switch, Route, useHistory } from 'react-router-dom'

import Landing from 'components/Landing'
import Tracks from 'components/Tracks'
import Events from 'components/Events'
import FlightProfiles from 'components/FlightProfiles'
import Places from 'components/Places'
import Suits from 'components/Suits'
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
      <Route path="/suits" component={Suits} />
    </Switch>
  )
}

export default AppRouter
