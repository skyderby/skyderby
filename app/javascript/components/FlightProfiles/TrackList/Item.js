import React from 'react'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'
import PlaceLabel from 'components/PlaceLabel'
import { usePageContext } from 'components/PageContext'
import { Card, Row, Id, Comment, RecordedAt } from './elements'

const Item = ({ track }) => {
  const { selectedTracks, toggleTrack } = usePageContext()
  const active = selectedTracks.includes(track.id)

  const handleClick = () => toggleTrack(track.id)

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
