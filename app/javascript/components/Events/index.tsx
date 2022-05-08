import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import EventsIndex from './EventsIndex'
import EventTypeSelect from './EventTypeSelect'
import PerformanceCompetition from './PerformanceCompetition'
import SpeedSkydivingCompetition from './SpeedSkydivingCompetition'

const Events = () => {
  return (
    <Routes>
      <Route index element={<EventsIndex />} />
      <Route path="/new" element={<EventTypeSelect />} />
      <Route path="/performance/*" element={<PerformanceCompetition />} />
      <Route path="/speed_skydiving/*" element={<SpeedSkydivingCompetition />} />

      <Route path="*" element={<Navigate to="/events" />} />
    </Routes>
  )
}

export default Events
