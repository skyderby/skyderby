import React from 'react'
import { Route, Routes } from 'react-router-dom'

import PlacesIndex from 'components/Places/PlacesIndex'
import Place from 'components/Places/Place'
import NewPlace from './NewPlace'

const Places = () => {
  return (
    <Routes>
      <Route index element={<PlacesIndex />} />
      <Route path=":id/*" element={<Place />} />
      <Route path="new" element={<NewPlace />} />
    </Routes>
  )
}

export default Places
