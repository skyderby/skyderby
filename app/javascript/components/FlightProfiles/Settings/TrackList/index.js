import React from 'react'
import { useSelector } from 'react-redux'

import { selectAllTracks } from 'redux/flightProfiles/tracksList'
import Item from './Item'
import { Container } from './elements'
import TracksFilter from './TracksFilter'

const TrackList = () => {
  const tracks = useSelector(selectAllTracks)

  return (
    <Container>
      <TracksFilter />

      {tracks.map(({ id }) => (
        <Item key={id} trackId={id} />
      ))}
    </Container>
  )
}

export default TrackList
