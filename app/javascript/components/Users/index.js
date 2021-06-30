import React from 'react'
import { Switch, Route } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useCurrentUserQuery } from 'api/hooks/sessions'
import SignIn from './SignIn'
import SignUp from './SignUp'
import SuccessRegistration from './SuccessRegistration'
import EmailConfirmation from './EmailConfirmation'

const Users = ({ match }) => {
  const { data: currentUser } = useCurrentUserQuery()

  if (currentUser?.authorized) return null

  return (
    <Switch>
      <Route path={`${match.path}/sign-in`} component={SignIn} />
      <Route path={`${match.path}/sign-up`} component={SignUp} />
      <Route
        path={`${match.path}/success-registration`}
        component={SuccessRegistration}
      />
      <Route path={`${match.path}/email-confirmation`} component={EmailConfirmation} />
    </Switch>
  )
}

Users.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired
  }).isRequired
}

export default Users
