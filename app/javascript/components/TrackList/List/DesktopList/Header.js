import React from 'react'

import { Thead, Tr, TableCell } from './elements'

const Header = () => {
  return (
    <Thead>
      <Tr>
        <TableCell>#</TableCell>
        <TableCell>Pilot</TableCell>
        <TableCell>Suit</TableCell>
        <TableCell>Place</TableCell>
        <TableCell>Comment</TableCell>
        <TableCell>Distance</TableCell>
        <TableCell>Speed</TableCell>
        <TableCell>Time</TableCell>
        <TableCell>Recorded at</TableCell>
      </Tr>
    </Thead>
  )
}

export default Header
