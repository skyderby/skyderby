import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { useCurrentUserQuery } from 'api/sessions'
import SignIn from './SignIn'
import SignUp from './SignUp'
import EmailConfirmation from './EmailConfirmation'
import UsersIndex from './UsersIndex'

const Users = (): JSX.Element | null => {
  const { data: currentUser, isLoading } = useCurrentUserQuery()

  if (isLoading) return null

  if (currentUser?.authorized) {
    return (
      <Routes>
        {currentUser?.permissions?.canManageUsers && (
          <Route index element={<UsersIndex />} />
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  } else {
    return (
      <Routes>
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="email-confirmation" element={<EmailConfirmation />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  }
}

export default Users
