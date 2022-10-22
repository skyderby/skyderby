import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { useCurrentUserQuery } from 'api/sessions'
import SignIn from './SignIn'
import SignUp from './SignUp'
import ForgotPassword from './ForgotPassword'
import NewPassword from './NewPassword'
import ResendConfirmation from './ResendConfirmation'
import EmailConfirmation from './EmailConfirmation'
import Layout from 'components/Users/Layout'

const Users = (): JSX.Element | null => {
  const { data: currentUser, isSuccess } = useCurrentUserQuery()

  if (!isSuccess) return null

  if (currentUser?.authorized) {
    return <Navigate replace to="/" />
  } else {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="new-password" element={<NewPassword />} />
          <Route path="resend-confirmation" element={<ResendConfirmation />} />
          <Route path="email-confirmation" element={<EmailConfirmation />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  }
}

export default Users
