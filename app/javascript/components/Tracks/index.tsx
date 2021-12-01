import React from 'react'
import { Routes, Route } from 'react-router-dom'

import TracksIndex from './TracksIndex'
import Track from './Track'

const Tracks = (): JSX.Element => (
  <Routes>
    <Route path="/" element={<TracksIndex />} />
    <Route path=":id/*" element={<Track />} />
  </Routes>
)

export default Tracks
