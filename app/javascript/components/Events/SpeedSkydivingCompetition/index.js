import React from 'react'
import { Route, Routes } from 'react-router-dom'

import NewEvent from './NewEvent'
import Show from './Show'

const SpeedSkydivingCompetition = () => {
  return (
    <Routes>
      <Route exact path="new" element={<NewEvent />} />
      <Route path=":eventId/*" element={<Show />} />
    </Routes>
  )
}

export default SpeedSkydivingCompetition
