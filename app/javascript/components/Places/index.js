import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import AppShell from 'components/AppShell'
import PlacesIndex from 'components/Places/PlacesIndex'
import Place from 'components/Places/Place'
import NewPlace from './NewPlace'
import { useCurrentUserQuery } from 'api/hooks/sessions'

const Places = () => {
  const { data: currentUser } = useCurrentUserQuery()
  const canCreatePlace = currentUser?.permissions.canCreatePlace

  return (
    <AppShell fullScreen>
      <Switch>
        <Route exact path="/places" component={PlacesIndex} />
        <Route exact path="/places/new">
          {canCreatePlace ? <NewPlace /> : <Redirect to="/places" />}
        </Route>
        <Route path="/places/:id(\d+)" component={Place} />
      </Switch>
    </AppShell>
  )
}

export default Places
