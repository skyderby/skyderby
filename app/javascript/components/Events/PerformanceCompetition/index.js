import React from 'react'
import { Route, Routes } from 'react-router-dom'

import NewEvent from './NewEvent'
import Show from './Show'

const PerformanceCompetition = () => (
  <Routes>
    <Route path="new" element={<NewEvent />} />
    <Route path=":eventId/*" element={<Show />} />
  </Routes>
)

export default PerformanceCompetition
