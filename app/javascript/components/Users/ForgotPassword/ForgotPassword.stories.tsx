import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Layout from 'components/Users/Layout'
import ForgotPassword from './'

export default {
  title: 'screens/ForgotPassword',
  component: ForgotPassword
}

export const Default = () => (
  <Routes>
    <Route path="*" element={<Layout />}>
      <Route path="*" element={<ForgotPassword />} />
    </Route>
  </Routes>
)
