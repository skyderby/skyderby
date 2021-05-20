import React from 'react'
import { Route, Switch } from 'react-router-dom'

import AppShell from 'components/AppShell'
import PlacesIndex from 'components/Places/PlacesIndex'
import Place from 'components/Places/Place'

const Places = () => {
  return (
    <AppShell fullScreen>
      <Switch>
        <Route exact path="/places" component={PlacesIndex} />
        <Route path="/places/:id" component={Place} />
      </Switch>
    </AppShell>
  )
}

export default Places
