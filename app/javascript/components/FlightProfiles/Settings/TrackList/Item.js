import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'
import PlaceLabel from 'components/PlaceLabel'
import { selectTrack, toggleTrack, isTrackSelected } from 'redux/flightProfiles'
import { Card, Row, Id, Comment, RecordedAt } from './elements'

const Item = ({ trackId }) => {
  const dispatch = useDispatch()
  const track = useSelector(state => selectTrack(state, trackId))
  const active = useSelector(state => isTrackSelected(state, trackId))

  const handleClick = () => dispatch(toggleTrack(trackId))

  return (
    <Card onClick={handleClick} active={active}>
      <Row>
        <Id>{track.id}</Id>
        <RecordedAt>{track.recordedAt}</RecordedAt>
      </Row>
      <Row>{track.pilotName}</Row>
      <Row>
        <PlaceLabel name={track.placeName} code={track.countryCode} />
        <SuitLabel name={track.suitName} code={track.manufacturerCode} />
      </Row>
      <Comment>{track.comment}</Comment>
    </Card>
  )
}

Item.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default Item
