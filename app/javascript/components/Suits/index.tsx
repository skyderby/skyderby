import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Overview from './Overview'
import MakeSuits from './MakeSuits'
import Show from './Show'

const Suits = (): JSX.Element => (
  <Routes>
    <Route index element={<Overview />} />
    <Route path="make/:id" element={<MakeSuits />} />
    <Route path=":id" element={<Show />} />
  </Routes>
)

export default Suits
