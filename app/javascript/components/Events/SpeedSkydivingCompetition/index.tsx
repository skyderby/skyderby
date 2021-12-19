import React from 'react'
import { Route, Routes } from 'react-router-dom'

import NewEvent from './NewEvent'
import Show from './Show'

const SpeedSkydivingCompetition = (): JSX.Element => {
  return (
    <Routes>
      <Route path="new" element={<NewEvent />} />
      <Route path=":eventId/*" element={<Show />} />
    </Routes>
  )
}

export default SpeedSkydivingCompetition
