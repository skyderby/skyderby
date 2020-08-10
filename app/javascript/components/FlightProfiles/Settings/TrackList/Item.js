import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'
import PlaceLabel from 'components/PlaceLabel'
import { toggleTrack, isTrackSelected } from 'redux/flightProfiles'
import { Card, Row, Id, Comment, RecordedAt } from './elements'

const Item = ({ track }) => {
  const dispatch = useDispatch()
  const active = useSelector(state => isTrackSelected(state, track.id))

  const handleClick = () => dispatch(toggleTrack(track.id))

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
  track: PropTypes.shape({
    id: PropTypes.number.isRequired,
    pilotName: PropTypes.string.isRequired,
    suitName: PropTypes.string.isRequired,
    placeName: PropTypes.string.isRequired,
    countryCode: PropTypes.string,
    manufacturerCode: PropTypes.string,
    comment: PropTypes.string,
    recordedAt: PropTypes.string
  }).isRequired
}

export default Item
