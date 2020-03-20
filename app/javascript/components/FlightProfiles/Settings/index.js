import React from 'react'
import { useDispatch } from 'react-redux'

import { selectTerrainProfile } from 'redux/flightProfiles'
import TrackList from './TrackList'
import TerrainProfileSelect from './TerrainProfileSelect'
import { Container, Settings } from './elements'

const Sidebar = () => {
  const dispatch = useDispatch()
  const handleTerrainProfileChange = ({ value }) => dispatch(selectTerrainProfile(value))

  return (
    <Container>
      <TrackList />
      <Settings>
        <TerrainProfileSelect onChange={handleTerrainProfileChange} />
      </Settings>
    </Container>
  )
}

export default Sidebar
