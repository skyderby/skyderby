import React from 'react'
import { Switch, Route, Redirect, match } from 'react-router-dom'

import { useCurrentUserQuery } from 'api/hooks/sessions'
import SignIn from './SignIn'
import SignUp from './SignUp'
import EmailConfirmation from './EmailConfirmation'

type UsersProps = {
  match: match
}

const Users = ({ match }: UsersProps): JSX.Element => {
  const { data: currentUser } = useCurrentUserQuery()

  if (currentUser?.authorized) return <Redirect to="/" />

  return (
    <Switch>
      <Route path={`${match.path}/sign-in`} component={SignIn} />
      <Route path={`${match.path}/sign-up`} component={SignUp} />
      <Route path={`${match.path}/email-confirmation`} component={EmailConfirmation} />
    </Switch>
  )
}

export default Users
