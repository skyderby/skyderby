import React from 'react'
import { Route, Routes } from 'react-router-dom'

import SignUp from './'
import Layout from 'components/Users/Layout'

export default {
  title: 'screens/SignUp',
  component: SignUp
}

export const Default = () => (
  <Routes>
    <Route path="*" element={<Layout />}>
      <Route path="*" element={<SignUp />} />
    </Route>
  </Routes>
)
