import React from 'react'

import TrackList from './TrackList'
import TerrainProfileSelect from './TerrainProfileSelect'
import { Container, Settings } from './elements'

const Sidebar = () => {
  return (
    <Container>
      <TrackList />
      <Settings>
        <TerrainProfileSelect />
      </Settings>
    </Container>
  )
}

export default Sidebar
