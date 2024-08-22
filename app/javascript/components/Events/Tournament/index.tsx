import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Show from './Show'

const Tournament = () => {
  return (
    <Routes>
      <Route path="new" element={<div>New Tournament Form</div>} />
      <Route path=":id/*" element={<Show />} />
    </Routes>
  )
}

export default Tournament
