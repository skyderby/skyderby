import React, { useEffect, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { loadSession, selectCurrentUser } from 'redux/session'
import Home from 'pages/Home'
import FlightProfiles from 'pages/FlightProfiles'
import SuitsIndex from 'pages/suits/Index'
import SuitsOverview from 'pages/suits/Overview'
import SuitsShow from 'pages/suits/Show'
import SuitsEdit from 'pages/suits/Edit'
import UsersSignIn from 'pages/users/SignIn'
import UsersSignUp from 'pages/users/SignUp'
import EmailConfirmation from 'pages/users/EmailConfirmation'
import SuccessRegistration from 'pages/users/SuccessRegistration'
import Loading from 'components/PageWrapper/Loading'
import Places from 'components/Places'
import Events from 'components/Events'
import Tracks from 'components/Tracks'

const AppRouter = () => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const currentUser = useSelector(selectCurrentUser)

  useEffect(() => {
    dispatch(loadSession()).then(() => setIsLoading(false))
  }, [dispatch, setIsLoading])

  if (isLoading) return <Loading />

  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/flight_profiles" component={FlightProfiles} />
      <Route path="/tracks" component={Tracks} />
      <Route path="/events" component={Events} />
      <Route path="/places" component={Places} />

      <Route exact path="/suits" component={SuitsOverview} />
      <Route path="/suits/make/:id" component={SuitsIndex} />
      <Route path="/suits/:id/edit" component={SuitsEdit} />
      <Route path="/suits/:id" component={SuitsShow} />

      {!currentUser?.authorized && (
        <>
          <Route path="/sign-in" component={UsersSignIn} />
          <Route path="/sign-up" component={UsersSignUp} />
          <Route path="/success-registration" component={SuccessRegistration} />
          <Route path="/email-confirmation" component={EmailConfirmation} />
        </>
      )}
    </Switch>
  )
}

export default AppRouter
