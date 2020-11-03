import React from 'react'
import PropTypes from 'prop-types'

import SignIn from 'components/Users/SignIn'

const UserSignIn = ({ location }) => {
  const defaultAfterLoginUrl = '/'
  const afterLoginUrl = location.state?.afterLoginUrl || defaultAfterLoginUrl

  return <SignIn afterLoginUrl={afterLoginUrl} />
}

UserSignIn.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      afterLoginUrl: PropTypes.string
    })
  })
}

export default UserSignIn
