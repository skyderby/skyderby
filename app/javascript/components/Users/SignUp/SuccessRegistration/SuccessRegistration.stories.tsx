import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Layout from 'components/Users/Layout'
import SuccessRegistration from './'

export default {
  title: 'screens/SuccessRegistration',
  component: SuccessRegistration
}

export const Default = () => (
  <Routes>
    <Route path="*" element={<Layout />}>
      <Route path="*" element={<SuccessRegistration />} />
    </Route>
  </Routes>
)
