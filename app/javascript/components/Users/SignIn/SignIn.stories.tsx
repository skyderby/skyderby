import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Layout from 'components/Users/Layout'
import SignIn from './'

export default {
  title: 'screens/SignIn',
  component: SignIn
}

export const Default = () => (
  <Routes>
    <Route path="*" element={<Layout />}>
      <Route path="*" element={<SignIn />} />
    </Route>
  </Routes>
)
