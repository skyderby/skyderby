import React from 'react'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'
import PlaceLabel from 'components/PlaceLabel'
import { TrackLink, Result, Id, Pilot, Suit, Place, Comment, Timestamp } from './elements'

const Item = ({ track }) => (
  <TrackLink
    to={location => ({
      pathname: `/tracks/${track.id}`,
      state: { returnTo: { ...location } }
    })}
    key={track.id}
  >
    <Id>{track.id}</Id>
    <Pilot>{track.pilotName}</Pilot>
    <Suit>
      <SuitLabel name={track.suitName} code={track.manufacturerCode} />
    </Suit>
    <Place>
      <PlaceLabel name={track.placeName} code={track.countryCode} />
    </Place>
    <Comment>{track.comment}</Comment>
    <Result>{track.distance || '—'}</Result>
    <Result>{track.speed || '—'}</Result>
    <Result>{track.time ? track.time.toFixed(1) : '—'}</Result>
    <Timestamp>{track.recordedAt}</Timestamp>
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
