import React from 'react'
import { Route, Switch } from 'react-router-dom'

import AppShell from 'components/AppShell'
import PlacesIndex from 'components/Places/PlacesIndex'
import Place from 'components/Places/Place'
import NewPlace from './NewPlace'

const Places = () => {
  return (
    <AppShell fullScreen>
      <Switch>
        <Route exact path="/places" component={PlacesIndex} />
        <Route exact path="/places/new" component={NewPlace} />
        <Route path="/places/:id" component={Place} />
      </Switch>
    </AppShell>
  )
}

export default Places
