import React from 'react'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'
import PlaceLabel from 'components/PlaceLabel'
import { TrackLink, TableCell } from './elements'

const Item = ({ track }) => (
  <TrackLink to={`/tracks/${track.id}`} key={track.id}>
    <TableCell>{track.id}</TableCell>
    <TableCell>{track.pilotName}</TableCell>
    <TableCell>
      <SuitLabel name={track.suitName} code={track.manufacturerCode} />
    </TableCell>
    <TableCell>
      <PlaceLabel name={track.placeName} code={track.countryCode} />
    </TableCell>
    <TableCell>{track.comment}</TableCell>
    <TableCell>{track.distance || '—'}</TableCell>
    <TableCell>{track.speed || '—'}</TableCell>
    <TableCell>{track.time ? track.time.toFixed(1) : '—'}</TableCell>
    <TableCell>{track.recordedAt}</TableCell>
  </TrackLink>
)

Item.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.number.isRequired,
    pilotName: PropTypes.string.isRequired,
    suitName: PropTypes.string.isRequired,
    manufacturerCode: PropTypes.string,
    placeName: PropTypes.string.isRequired,
    countryCode: PropTypes.string,
    comment: PropTypes.string,
    distance: PropTypes.number,
    speed: PropTypes.number,
    time: PropTypes.number,
    recordedAt: PropTypes.string
  }).isRequired
}
export default Item
