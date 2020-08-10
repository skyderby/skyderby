import React from 'react'
import { useSelector } from 'react-redux'

import { selectAllTracks } from 'redux/tracks/tracksIndex/selectors'

import Header from './Header'
import Item from './Item'
import { Container, Table, Tbody } from './elements'

const List = () => {
  const tracks = useSelector(selectAllTracks)

  return (
    <Container>
      <Table aria-label="Tracks list">
        <Header />
        <Tbody>
          {tracks.map(track => (
            <Item key={track.id} track={track} />
          ))}
        </Tbody>
      </Table>
    </Container>
  )
}

export default List
