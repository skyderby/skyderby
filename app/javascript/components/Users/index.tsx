import React from 'react'
import { Switch, Route, Redirect, match } from 'react-router-dom'

import { useCurrentUserQuery } from 'api/sessions'
import SignIn from './SignIn'
import SignUp from './SignUp'
import EmailConfirmation from './EmailConfirmation'
import UsersIndex from './UsersIndex'

type UsersProps = {
  match: match
}

const Users = ({ match }: UsersProps): JSX.Element | null => {
  const { data: currentUser, isLoading } = useCurrentUserQuery()

  if (isLoading) return null

  if (currentUser?.authorized) {
    return (
      <Switch>
        {currentUser?.permissions?.canManageUsers && (
          <Route path={`${match.path}/`} component={UsersIndex} />
        )}

        <Route component={() => <Redirect to="/" />} />
      </Switch>
    )
  } else {
    return (
      <Switch>
        <Route path={`${match.path}/sign-in`} component={SignIn} />
        <Route path={`${match.path}/sign-up`} component={SignUp} />
        <Route path={`${match.path}/email-confirmation`} component={EmailConfirmation} />

        <Route component={() => <Redirect to="/" />} />
      </Switch>
    )
  }
}

export default Users
