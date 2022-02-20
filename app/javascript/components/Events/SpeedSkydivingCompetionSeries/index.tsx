import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Show from './Show'

const SpeedSkydivingCompetionSeries = () => {
  return (
    <Routes>
      <Route path=":eventId/*" element={<Show />} />
    </Routes>
  )
}

export default SpeedSkydivingCompetionSeries
