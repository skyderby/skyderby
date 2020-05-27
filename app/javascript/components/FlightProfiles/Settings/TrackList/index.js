import React from 'react'
import { useSelector } from 'react-redux'

import { selectAllTracks } from 'redux/flightProfiles/tracksList'
import Item from './Item'
import { Container } from './elements'
import TokenizedSearchField from 'components/TokenizedSearchField'

const TrackList = () => {
  const tracks = useSelector(selectAllTracks)

  const handleChange = console.log

  return (
    <Container>
      <TokenizedSearchField initialValues={[]} dataTypes={[]} onChange={handleChange} />

      {tracks.map(({ id }) => (
        <Item key={id} trackId={id} />
      ))}
    </Container>
  )
}

export default TrackList
