import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { useCurrentUserQuery } from 'api/sessions'
import SignIn from './SignIn'
import SignUp from './SignUp'
import EmailConfirmation from './EmailConfirmation'
import UsersIndex from './UsersIndex'
import AppShell from 'components/AppShell'
import Layout from 'components/Users/Layout'

const Users = (): JSX.Element | null => {
  const { data: currentUser, isLoading } = useCurrentUserQuery()

  if (isLoading) return null

  if (currentUser?.authorized) {
    return (
      <Routes>
        <Route element={<AppShell />}>
          {currentUser?.permissions?.canManageUsers && (
            <Route index element={<UsersIndex />} />
          )}
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  } else {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="email-confirmation" element={<EmailConfirmation />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  }
}

export default Users
