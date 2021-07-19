import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import { useI18n } from 'components/TranslationsProvider'
import AppShell from 'components/AppShell'
import PlacesIndex from 'components/Places/PlacesIndex'
import Place from 'components/Places/Place'
import NewPlace from './NewPlace'
import Loading from 'components/PageWrapper/Loading'
import { useCurrentUserQuery } from 'api/hooks/sessions'

const Places = () => {
  const { data: currentUser, isLoading } = useCurrentUserQuery()
  const canCreatePlace = currentUser?.permissions.canCreatePlace
  const { t } = useI18n()

  return (
    <AppShell fullScreen>
      <Helmet>
        <title>{`${t('places.title')}`}</title>
        <meta name="description" content={t('places.description')} />
      </Helmet>
      {isLoading ? (
        <Loading />
      ) : (
        <Switch>
          <Route exact path="/places" component={PlacesIndex} />
          {canCreatePlace && <Route exact path="/places/new" component={NewPlace} />}
          <Route path="/places/:id(\d+)" component={Place} />
          <Route component={() => <Redirect to="/places" />} />
        </Switch>
      )}
    </AppShell>
  )
}

export default Places
